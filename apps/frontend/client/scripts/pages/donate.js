import { Buffer } from "buffer";
import { HDKey } from "@scure/bip32";
import {
  generateMnemonic,
  mnemonicToSeedSync,
  validateMnemonic
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import * as bitcoin from "bitcoinjs-lib";
import QRCode from "qrcode";
import {
  getAppConfig,
  getDonationChallenge,
  getTransactionStatus,
  getWalletActivity,
  getWalletBalance,
  getWalletUtxos,
  reserveDonationRequests,
  sendDonationHeartbeat,
  sendDonationTransaction,
  submitDonationFulfillment
} from "../api.js";
import {
  NETWORK_CONFIG,
  formatSatsAsCoins,
  isLikelyAddressForNetwork
} from "../consts.js";

const STORAGE_KEY = "donationWallet";
const DUST_THRESHOLD = 546;
const WALLET_AUTO_REFRESH_MS = 10000;

window.Buffer ??= Buffer;

let appConfig = null;
let pendingMnemonic = "";
let confirmationIndexes = [];
let confirmationStep = "password";
let unlockedWalletState = null;
let donationRuntimeState = {
  enabled: false,
  cycleTimeoutId: null,
  cycleInFlight: false,
  lastHeartbeatAt: 0,
  pendingTxId: ""
};
let walletActivityItems = [];
let walletActivityPage = 1;
let walletAutoRefreshIntervalId = null;

const WALLET_ACTIVITY_PAGE_SIZE = 8;

const DONATE_HASHES = {
  onboarding: "#donate",
  importWallet: "#import-wallet",
  createPassword: "#create-wallet-password",
  createMnemonic: "#create-wallet-mnemonic",
  createWords: "#create-wallet-confirm",
  unlockWallet: "#unlock-wallet",
  donationWallet: "#donation-wallet"
};

function $(selector) {
  return document.querySelector(selector);
}

function showSection(sectionName) {
  const sections = document.querySelectorAll("[data-donate-section]");

  for (const section of sections) {
    section.hidden = section.dataset.donateSection !== sectionName;
  }
}

function getCurrentHash() {
  return window.location.hash || DONATE_HASHES.onboarding;
}

function setHash(hash) {
  if (hash === DONATE_HASHES.onboarding) {
    if (!window.location.hash) {
      applyHashRoute();
      return;
    }

    window.history.pushState(null, "", window.location.pathname + window.location.search);
    applyHashRoute();
    return;
  }

  if (window.location.hash === hash) {
    applyHashRoute();
    return;
  }

  window.location.hash = hash;
}

function getBitcoinNetwork() {
  return appConfig?.network === "mainnet"
    ? bitcoin.networks.bitcoin
    : bitcoin.networks.regtest;
}

function getCoinLabel() {
  return appConfig?.unitLabel ?? "BTC";
}

function getStoredWallet() {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeWallet(payload) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function updateStoredWallet(patch) {
  const storedWallet = getStoredWallet();

  if (!storedWallet) {
    return;
  }

  storeWallet({
    ...storedWallet,
    ...patch
  });
}

function clearWallet() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function setMessage(text, type = "") {
  const node = $("[data-donate-message]");

  if (!node) {
    return;
  }

  node.textContent = text;
  node.dataset.messageType = type;
  node.hidden = !text;
}

function bytesToBase64(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function deriveEncryptionKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptMnemonic(mnemonic, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(password, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(mnemonic)
  );

  return {
    cipherText: bytesToBase64(new Uint8Array(cipher)),
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv)
  };
}

async function decryptMnemonic(payload, password) {
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const cipherText = base64ToBytes(payload.cipherText);
  const key = await deriveEncryptionKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherText
  );

  return new TextDecoder().decode(decrypted);
}

function deriveWallet(mnemonic) {
  const metadata = NETWORK_CONFIG[appConfig?.network ?? "mainnet"];
  const seed = mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const derivationPath = `m/84'/${metadata.bip84CoinType}'/0'/0/0`;
  const child = root.derive(derivationPath);
  const publicKey = Buffer.from(child.publicKey ?? new Uint8Array());
  const payment = bitcoin.payments.p2wpkh({
    pubkey: publicKey,
    network: getBitcoinNetwork()
  });

  return {
    address: payment.address ?? "",
    derivationPath,
    publicKeyHex: publicKey.toString("hex"),
    outputScript: payment.output ? Buffer.from(payment.output) : Buffer.alloc(0),
    signer: {
      publicKey,
      sign(hash) {
        return Buffer.from(child.sign(hash));
      }
    },
    signChallengeHash(challengeHash) {
      return Buffer.from(child.sign(challengeHash)).toString("hex");
    }
  };
}

async function getChallengeHashBytes(challengeHex) {
  const challengeBytes = Uint8Array.from(Buffer.from(challengeHex, "hex"));
  const digest = await crypto.subtle.digest("SHA-256", challengeBytes);
  return new Uint8Array(digest);
}

function clearScheduledCycle() {
  if (donationRuntimeState.cycleTimeoutId) {
    window.clearTimeout(donationRuntimeState.cycleTimeoutId);
    donationRuntimeState.cycleTimeoutId = null;
  }
}

function clearWalletAutoRefresh() {
  if (walletAutoRefreshIntervalId) {
    window.clearInterval(walletAutoRefreshIntervalId);
    walletAutoRefreshIntervalId = null;
  }
}

function getMaxRequestsPerTx() {
  const input = $("[data-max-requests-input]");
  const storedWallet = getStoredWallet();
  const fallback = Number(storedWallet?.maxRequestsPerTx ?? 1) || 1;

  if (!input) {
    return fallback;
  }

  const value = Number(input.value ?? fallback);
  return Math.min(Math.max(value || fallback, 1), 25);
}

function getFeeRateSatPerVbyte() {
  const input = $("[data-fee-rate-input]");
  const storedWallet = getStoredWallet();
  const fallback =
    Number(
      storedWallet?.feeRateSatPerVbyte ?? appConfig?.donations?.feeRateSatPerVbyte ?? 2
    ) || 2;

  if (!input) {
    return fallback;
  }

  const value = Number(input.value ?? fallback);
  return Math.min(Math.max(value || fallback, 1), 500);
}

function setMaxRequestsInputValue(value) {
  const input = $("[data-max-requests-input]");

  if (input) {
    input.value = String(Math.min(Math.max(Number(value) || 1, 1), 25));
  }
}

function setFeeRateInputValue(value) {
  const input = $("[data-fee-rate-input]");

  if (input) {
    input.value = String(Math.min(Math.max(Number(value) || 2, 1), 500));
  }
}

function setMaxRequestsEditing(isEditing) {
  const input = $("[data-max-requests-input]");
  const editButton = $("[data-edit-max-requests]");
  const saveButton = $("[data-save-max-requests]");

  if (input) {
    input.disabled = !isEditing || donationRuntimeState.enabled;
  }

  if (editButton) {
    editButton.disabled = donationRuntimeState.enabled || isEditing;
  }

  if (saveButton) {
    saveButton.hidden = !isEditing;
    saveButton.disabled = donationRuntimeState.enabled;
  }
}

function setFeeRateEditing(isEditing) {
  const input = $("[data-fee-rate-input]");
  const editButton = $("[data-edit-fee-rate]");
  const saveButton = $("[data-save-fee-rate]");

  if (input) {
    input.disabled = !isEditing || donationRuntimeState.enabled;
  }

  if (editButton) {
    editButton.disabled = donationRuntimeState.enabled || isEditing;
  }

  if (saveButton) {
    saveButton.hidden = !isEditing;
    saveButton.disabled = donationRuntimeState.enabled;
  }
}

function setSendStatus(text, type = "") {
  const node = $("[data-send-status]");

  if (!node) {
    return;
  }

  node.textContent = text;
  node.dataset.messageType = type;
}

function renderExecutionStatus(text, isRunning = false) {
  const dot = $("[data-donation-running-dot]");
  const textNode = $("[data-donation-running-text]");
  const startButton = $("[data-start-donations]");
  const stopButton = $("[data-stop-donations]");
  const editButton = $("[data-edit-max-requests]");
  const maxInput = $("[data-max-requests-input]");
  const feeRateEditButton = $("[data-edit-fee-rate]");
  const feeRateInput = $("[data-fee-rate-input]");
  const feeRateSaveButton = $("[data-save-fee-rate]");

  if (dot) {
    dot.hidden = !isRunning;
  }

  if (textNode) {
    textNode.textContent = text;
  }

  if (startButton) {
    startButton.disabled = isRunning;
  }

  if (stopButton) {
    stopButton.disabled = !isRunning;
  }

  if (editButton) {
    editButton.disabled = isRunning || !maxInput?.disabled;
  }

  if (feeRateEditButton) {
    feeRateEditButton.disabled = isRunning || !feeRateInput?.disabled;
  }

  if (feeRateInput) {
    feeRateInput.disabled = isRunning || feeRateInput.disabled;
  }

  if (feeRateSaveButton) {
    feeRateSaveButton.disabled = isRunning;
  }
}

async function updateWalletBalance(address) {
  const balanceNode = $("[data-donation-balance]");
  const result = await getWalletBalance(address);

  if (!balanceNode) {
    return;
  }

  if (!result.ok) {
    balanceNode.textContent = "Unable to load balance";
    return;
  }

  const confirmed = Number(result.data?.confirmed ?? 0);
  const unconfirmed = Number(result.data?.unconfirmed ?? 0);
  balanceNode.textContent =
    formatSatsAsCoins(confirmed) +
    (unconfirmed ? ` (${formatSatsAsCoins(unconfirmed)} unconfirmed)` : "");
}

function setWalletActivityPagination(page, totalPages) {
  const prev = $("[data-wallet-activity-prev]");
  const next = $("[data-wallet-activity-next]");
  const label = $("[data-wallet-activity-page-label]");

  if (prev) {
    prev.disabled = page <= 1;
  }

  if (next) {
    next.disabled = page >= totalPages;
  }

  if (label) {
    label.textContent = `Page ${page} of ${totalPages}`;
  }
}

function renderWalletActivityTable() {
  const body = $("[data-wallet-activity]");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (!walletActivityItems.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="4">No activity yet.</td>';
    body.appendChild(row);
    setWalletActivityPagination(1, 1);
    return;
  }

  const totalPages = Math.max(
    Math.ceil(walletActivityItems.length / WALLET_ACTIVITY_PAGE_SIZE),
    1
  );
  walletActivityPage = Math.min(Math.max(walletActivityPage, 1), totalPages);

  const visibleItems = walletActivityItems.slice(
    (walletActivityPage - 1) * WALLET_ACTIVITY_PAGE_SIZE,
    walletActivityPage * WALLET_ACTIVITY_PAGE_SIZE
  );

  for (const item of visibleItems) {
    const row = document.createElement("tr");
    const typeCell = document.createElement("td");
    const amountCell = document.createElement("td");
    const whenCell = document.createElement("td");
    const txCell = document.createElement("td");
    const link = document.createElement("a");

    if (item.type === "faucet_fulfillment") {
      typeCell.textContent =
        `Fulfilled ${item.requestCount} faucet request` +
        `${item.requestCount === 1 ? "" : "s"}`;
    } else if (item.type === "send") {
      typeCell.textContent = "Sent";
    } else {
      typeCell.textContent = "Deposit";
    }

    amountCell.textContent = formatSatsAsCoins(item.amountSats);
    whenCell.textContent = item.occurredAt
      ? new Date(item.occurredAt).toLocaleString()
      : "Pending";

    if (item.explorerUrl) {
      link.href = item.explorerUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "view tx";
      txCell.appendChild(link);
    } else {
      txCell.textContent = "Unavailable";
    }

    row.append(typeCell, amountCell, whenCell, txCell);
    body.append(row);
  }

  setWalletActivityPagination(walletActivityPage, totalPages);
}

async function renderWalletActivity(address) {
  const result = await getWalletActivity(address, 50);

  walletActivityPage = 1;

  if (!result.ok || !Array.isArray(result.data?.items)) {
    walletActivityItems = [];
    renderWalletActivityTable();
    return;
  }

  walletActivityItems = result.data.items;
  renderWalletActivityTable();
}

function createRandomConfirmationIndexes(wordCount) {
  const chosen = new Set();

  while (chosen.size < 4) {
    chosen.add(Math.floor(Math.random() * wordCount));
  }

  return [...chosen].sort((left, right) => left - right);
}

function showConfirmationStep(stepName) {
  confirmationStep = stepName;

  const steps = document.querySelectorAll("[data-confirm-step]");

  for (const step of steps) {
    step.hidden = step.dataset.confirmStep !== stepName;
  }
}

function showCreateWalletStep(stepName) {
  showSection("confirm");
  showConfirmationStep(stepName);
}

function renderMnemonicWords() {
  const container = $("[data-generated-mnemonic]");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const words = pendingMnemonic.split(/\s+/);

  for (const [index, word] of words.entries()) {
    const row = document.createElement("div");
    row.className = "mnemonic-word";

    const number = document.createElement("strong");
    number.textContent = `${index + 1}.`;

    const text = document.createElement("span");
    text.textContent = ` ${word}`;

    row.append(number, text);
    container.append(row);
  }
}

function renderConfirmationPrompts() {
  const container = $("[data-confirm-words]");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  for (const wordIndex of confirmationIndexes) {
    const label = document.createElement("label");
    label.textContent = `What was word ${wordIndex + 1}?`;

    const input = document.createElement("input");
    input.type = "text";
    input.dataset.confirmWordIndex = String(wordIndex);
    input.autocomplete = "off";
    input.addEventListener("input", syncSaveWalletState);
    input.addEventListener("keydown", (event) =>
      handleEnterSubmit(event, "[data-save-wallet]")
    );

    container.append(label, input);
  }
}

function validatePendingPassword() {
  const password = String($("[data-wallet-password]")?.value ?? "");
  const confirmPassword = String($("[data-wallet-password-confirm]")?.value ?? "");

  if (password.length < 8) {
    setMessage("Please choose a password with at least 8 characters.", "error");
    return false;
  }

  if (password !== confirmPassword) {
    setMessage("The password confirmation did not match.", "error");
    return false;
  }

  return true;
}

function syncPasswordStepState() {
  const password = String($("[data-wallet-password]")?.value ?? "").trim();
  const confirmPassword = String($("[data-wallet-password-confirm]")?.value ?? "").trim();
  const continueButton = $("[data-confirm-next]");

  if (continueButton) {
    continueButton.disabled = !password || !confirmPassword;
  }
}

function handlePasswordStepSubmit(event) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();

  const continueButton = $("[data-confirm-next]");

  if (!continueButton?.disabled) {
    continueButton.click();
  }
}

function handleEnterSubmit(event, buttonSelector) {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();

  const button = $(buttonSelector);

  if (!button?.disabled) {
    button.click();
  }
}

function validateConfirmationInputs() {
  const words = pendingMnemonic.split(/\s+/);
  const inputs = document.querySelectorAll("[data-confirm-word-index]");

  for (const input of inputs) {
    const index = Number(input.dataset.confirmWordIndex);
    const expectedWord = words[index];
    const providedWord = input.value.trim().toLowerCase();

    if (providedWord !== expectedWord) {
      return false;
    }
  }

  return true;
}

function syncSaveWalletState() {
  const saveButton = $("[data-save-wallet]");

  if (saveButton) {
    saveButton.disabled = !validateConfirmationInputs();
  }
}

function prepareMnemonicFlow(mnemonic) {
  pendingMnemonic = mnemonic.trim().toLowerCase();
  confirmationIndexes = createRandomConfirmationIndexes(
    pendingMnemonic.split(/\s+/).length
  );

  const passwordInput = $("[data-wallet-password]");
  const confirmPasswordInput = $("[data-wallet-password-confirm]");
  const unlockPasswordInput = $("[data-unlock-password]");

  if (passwordInput) {
    passwordInput.value = "";
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.value = "";
  }

  if (unlockPasswordInput) {
    unlockPasswordInput.value = "";
  }

  renderMnemonicWords();
  renderConfirmationPrompts();
  syncPasswordStepState();
  syncSaveWalletState();
  setMessage("", "");
  setHash(DONATE_HASHES.createPassword);
}

function isStoredWalletCompatible(storedWallet) {
  if (!storedWallet || !storedWallet.network) {
    return true;
  }

  return storedWallet.network === appConfig?.network;
}

function clearUnlockedWalletRuntime() {
  clearScheduledCycle();
  clearWalletAutoRefresh();
  unlockedWalletState = null;
  donationRuntimeState = {
    enabled: false,
    cycleTimeoutId: null,
    cycleInFlight: false,
    lastHeartbeatAt: 0,
    pendingTxId: ""
  };
}

function estimateFee(inputCount, outputCount, feeRateSatPerVbyte) {
  const virtualBytes = 11 + inputCount * 68 + outputCount * 31;
  return Math.ceil(virtualBytes * feeRateSatPerVbyte);
}

async function maybeHeartbeat() {
  if (!unlockedWalletState || !donationRuntimeState.enabled) {
    return true;
  }

  const heartbeatIntervalMs =
    Number(appConfig?.donations?.heartbeatPollMs) || 60000;

  if (
    donationRuntimeState.lastHeartbeatAt &&
    Date.now() - donationRuntimeState.lastHeartbeatAt < heartbeatIntervalMs
  ) {
    return true;
  }

  const challengeResult = await getDonationChallenge();

  if (!challengeResult.ok) {
    setMessage("Unable to refresh the donation challenge right now.", "error");
    return false;
  }

  const challenge = String(challengeResult.data?.challenge ?? "");
  const challengeHash = await getChallengeHashBytes(challenge);
  const signatureHex = unlockedWalletState.signChallengeHash(challengeHash);
  const heartbeatResult = await sendDonationHeartbeat({
    address: unlockedWalletState.address,
    publicKeyHex: unlockedWalletState.publicKeyHex,
    challenge,
    signatureHex
  });

  if (!heartbeatResult.ok) {
    setMessage("Unable to prove donation wallet activity right now.", "error");
    return false;
  }

  donationRuntimeState.lastHeartbeatAt = Date.now();
  return true;
}

async function buildFulfillmentTransaction(reservedRequests) {
  const utxoResult = await getWalletUtxos(unlockedWalletState.address);

  if (!utxoResult.ok) {
    throw new Error("Unable to load donation wallet UTXOs.");
  }

  const confirmedUtxos = [...(utxoResult.data?.utxos ?? [])]
    .filter((utxo) => Number(utxo.height ?? 0) > 0)
    .sort((left, right) => left.value - right.value);

  const feeRate = getFeeRateSatPerVbyte();
  const outputs = reservedRequests.map((request) => ({
    address: request.bitcoinAddress,
    value: Number(request.amountSats)
  }));
  const totalOutputs = outputs.reduce((sum, output) => sum + output.value, 0);
  const selectedInputs = [];
  let totalInputs = 0;

  for (const utxo of confirmedUtxos) {
    selectedInputs.push(utxo);
    totalInputs += Number(utxo.value ?? 0);

    const feeWithChange = estimateFee(
      selectedInputs.length,
      outputs.length + 1,
      feeRate
    );

    if (totalInputs >= totalOutputs + feeWithChange) {
      break;
    }
  }

  if (!selectedInputs.length) {
    throw new Error("This donation wallet has no confirmed spendable UTXOs.");
  }

  let fee = estimateFee(selectedInputs.length, outputs.length + 1, feeRate);
  let changeValue = totalInputs - totalOutputs - fee;
  let hasChange = changeValue > DUST_THRESHOLD;

  if (!hasChange) {
    fee = estimateFee(selectedInputs.length, outputs.length, feeRate);
    changeValue = totalInputs - totalOutputs - fee;
  }

  if (changeValue < 0) {
    throw new Error(
      `This donation wallet does not have enough confirmed ${getCoinLabel()} to fulfill the reserved requests.`
    );
  }

  const psbt = new bitcoin.Psbt({ network: getBitcoinNetwork() });

  for (const input of selectedInputs) {
    psbt.addInput({
      hash: input.txid,
      index: Number(input.vout),
      witnessUtxo: {
        script: unlockedWalletState.outputScript,
        value: BigInt(input.value)
      }
    });
  }

  for (const output of outputs) {
    psbt.addOutput({
      address: output.address,
      value: BigInt(output.value)
    });
  }

  if (hasChange && changeValue > DUST_THRESHOLD) {
    psbt.addOutput({
      address: unlockedWalletState.address,
      value: BigInt(changeValue)
    });
  }

  selectedInputs.forEach((_input, index) => {
    psbt.signInput(index, unlockedWalletState.signer);
  });

  psbt.finalizeAllInputs();

  return {
    rawTransactionHex: psbt.extractTransaction().toHex(),
    feeSats: fee
  };
}

async function buildSendTransaction(destinationAddress, amountSats) {
  const utxoResult = await getWalletUtxos(unlockedWalletState.address);

  if (!utxoResult.ok) {
    throw new Error("Unable to load donation wallet UTXOs.");
  }

  const confirmedUtxos = [...(utxoResult.data?.utxos ?? [])]
    .filter((utxo) => Number(utxo.height ?? 0) > 0)
    .sort((left, right) => left.value - right.value);

  const feeRate = getFeeRateSatPerVbyte();
  const outputs = [{ address: destinationAddress, value: Number(amountSats) }];
  const selectedInputs = [];
  let totalInputs = 0;

  for (const utxo of confirmedUtxos) {
    selectedInputs.push(utxo);
    totalInputs += Number(utxo.value ?? 0);

    const feeWithChange = estimateFee(selectedInputs.length, 2, feeRate);

    if (totalInputs >= Number(amountSats) + feeWithChange) {
      break;
    }
  }

  if (!selectedInputs.length) {
    throw new Error("This donation wallet has no confirmed spendable UTXOs.");
  }

  let fee = estimateFee(selectedInputs.length, 2, feeRate);
  let changeValue = totalInputs - Number(amountSats) - fee;
  let hasChange = changeValue > DUST_THRESHOLD;

  if (!hasChange) {
    fee = estimateFee(selectedInputs.length, 1, feeRate);
    changeValue = totalInputs - Number(amountSats) - fee;
  }

  if (changeValue < 0) {
    throw new Error(
      `This donation wallet does not have enough confirmed ${getCoinLabel()} to send ${formatSatsAsCoins(amountSats)}.`
    );
  }

  const psbt = new bitcoin.Psbt({ network: getBitcoinNetwork() });

  for (const input of selectedInputs) {
    psbt.addInput({
      hash: input.txid,
      index: Number(input.vout),
      witnessUtxo: {
        script: unlockedWalletState.outputScript,
        value: BigInt(input.value)
      }
    });
  }

  psbt.addOutput({
    address: destinationAddress,
    value: BigInt(amountSats)
  });

  if (hasChange && changeValue > DUST_THRESHOLD) {
    psbt.addOutput({
      address: unlockedWalletState.address,
      value: BigInt(changeValue)
    });
  }

  selectedInputs.forEach((_input, index) => {
    psbt.signInput(index, unlockedWalletState.signer);
  });

  psbt.finalizeAllInputs();

  return {
    rawTransactionHex: psbt.extractTransaction().toHex(),
    feeSats: fee
  };
}

function scheduleNextCycle(delayMs = null) {
  if (!donationRuntimeState.enabled) {
    return;
  }

  clearScheduledCycle();

  const delay =
    (delayMs ?? Number(appConfig?.donations?.executionPollMs)) || 15000;

  donationRuntimeState.cycleTimeoutId = window.setTimeout(() => {
    void runDonationExecutionCycle();
  }, delay);
}

function shouldAbortExecutionCycle() {
  return !donationRuntimeState.enabled || !unlockedWalletState;
}

async function runDonationExecutionCycle() {
  if (
    !donationRuntimeState.enabled ||
    !unlockedWalletState ||
    donationRuntimeState.cycleInFlight
  ) {
    return;
  }

  donationRuntimeState.cycleInFlight = true;

  try {
    const heartbeatOk = await maybeHeartbeat();

    if (!heartbeatOk || shouldAbortExecutionCycle()) {
      renderExecutionStatus("Donation wallet is running...", true);
      return;
    }

    if (donationRuntimeState.pendingTxId) {
      const txStatusResult = await getTransactionStatus(
        donationRuntimeState.pendingTxId
      );

      if (!txStatusResult.ok) {
        setMessage("Unable to refresh the pending donation transaction.", "error");
        renderExecutionStatus("Donation wallet is running...", true);
        return;
      }

      if (shouldAbortExecutionCycle()) {
        return;
      }

      if (!txStatusResult.data?.confirmed) {
        renderExecutionStatus(
          `Donation wallet is running... waiting for confirmation on ${donationRuntimeState.pendingTxId.slice(0, 12)}...`,
          true
        );
        return;
      }

      donationRuntimeState.pendingTxId = "";
      await Promise.all([
        updateWalletBalance(unlockedWalletState.address),
        renderWalletActivity(unlockedWalletState.address)
      ]);
    }

    const reserveResult = await reserveDonationRequests(
      unlockedWalletState.address,
      getMaxRequestsPerTx()
    );

    if (!reserveResult.ok) {
      setMessage("Unable to reserve faucet requests right now.", "error");
      renderExecutionStatus("Donation wallet is running...", true);
      return;
    }

    if (shouldAbortExecutionCycle()) {
      return;
    }

    const reservedRequests = reserveResult.data?.requests ?? [];

    if (!reservedRequests.length) {
      renderExecutionStatus(
        "Donation wallet is running... no queued faucet requests right now.",
        true
      );
      return;
    }

    const transaction = await buildFulfillmentTransaction(reservedRequests);

    if (shouldAbortExecutionCycle()) {
      return;
    }

    const submitResult = await submitDonationFulfillment(
      unlockedWalletState.address,
      reservedRequests.map((request) => request.id),
      transaction.rawTransactionHex
    );

    if (!submitResult.ok) {
      setMessage(
        "The signed donation transaction could not be submitted.",
        "error"
      );
      renderExecutionStatus("Donation wallet is running...", true);
      return;
    }

    donationRuntimeState.pendingTxId = String(submitResult.data?.txid ?? "");

    await Promise.all([
      updateWalletBalance(unlockedWalletState.address),
      renderWalletActivity(unlockedWalletState.address)
    ]);

    renderExecutionStatus(
      `Donation wallet is running... submitted ${donationRuntimeState.pendingTxId.slice(0, 12)}...`,
      true
    );
  } catch (error) {
    console.error(error);
    setMessage(
      error instanceof Error ? error.message : "Unable to run the donation wallet.",
      "error"
    );
    renderExecutionStatus("Donation wallet is running...", true);
  } finally {
    donationRuntimeState.cycleInFlight = false;

    if (donationRuntimeState.enabled) {
      scheduleNextCycle();
    }
  }
}

function startDonationLoop() {
  if (!unlockedWalletState) {
    return;
  }

  donationRuntimeState.enabled = true;
  donationRuntimeState.lastHeartbeatAt = 0;
  renderExecutionStatus("Donation wallet is running...", true);
  void runDonationExecutionCycle();
}

function stopDonationLoop() {
  donationRuntimeState.enabled = false;
  donationRuntimeState.pendingTxId = "";
  clearScheduledCycle();
  renderExecutionStatus("Donation wallet is stopped.", false);
}

async function saveWalletFromPendingMnemonic() {
  const password = String($("[data-wallet-password]")?.value ?? "");

  if (!pendingMnemonic) {
    setMessage("No mnemonic is ready to save.", "error");
    return;
  }

  if (!validatePendingPassword()) {
    return;
  }

  if (!validateConfirmationInputs()) {
    setMessage("The mnemonic confirmation words did not match.", "error");
    return;
  }

  const encrypted = await encryptMnemonic(pendingMnemonic, password);
  const wallet = deriveWallet(pendingMnemonic);
  unlockedWalletState = wallet;

  storeWallet({
    network: appConfig.network,
    maxRequestsPerTx: 1,
    feeRateSatPerVbyte: Number(appConfig?.donations?.feeRateSatPerVbyte ?? 2) || 2,
    ...encrypted,
    address: wallet.address,
    derivationPath: wallet.derivationPath,
    createdAt: new Date().toISOString()
  });

  await renderUnlockedWallet(wallet.address);
}

async function renderUnlockedWallet(addressOverride) {
  const storedWallet = getStoredWallet();
  const address = addressOverride ?? storedWallet?.address ?? "";
  const addressNode = $("[data-donation-address]");
  const networkNode = $("[data-donation-network]");
  const deleteButton = $("[data-delete-wallet]");
  const canvas = $("[data-wallet-qr]");

  if (addressNode) {
    addressNode.textContent = address;
  }

  if (networkNode) {
    networkNode.textContent = NETWORK_CONFIG[appConfig.network].label;
  }

  if (deleteButton) {
    deleteButton.hidden = appConfig.network !== "regtest";
  }

  if (canvas) {
    await QRCode.toCanvas(canvas, address, {
      width: 180,
      margin: 1
    });
  }

  setMaxRequestsInputValue(storedWallet?.maxRequestsPerTx ?? 1);
  setFeeRateInputValue(
    storedWallet?.feeRateSatPerVbyte ?? appConfig?.donations?.feeRateSatPerVbyte ?? 2
  );
  setMaxRequestsEditing(false);
  setFeeRateEditing(false);
  renderExecutionStatus("Donation wallet is stopped.", false);

  await Promise.all([
    updateWalletBalance(address),
    renderWalletActivity(address)
  ]);

  clearWalletAutoRefresh();
  walletAutoRefreshIntervalId = window.setInterval(() => {
    if (!unlockedWalletState) {
      clearWalletAutoRefresh();
      return;
    }

    void Promise.all([
      updateWalletBalance(unlockedWalletState.address),
      renderWalletActivity(unlockedWalletState.address)
    ]);
  }, WALLET_AUTO_REFRESH_MS);

  setMessage("", "");
  showSection("wallet");

  if (getCurrentHash() !== DONATE_HASHES.donationWallet) {
    window.history.replaceState(null, "", DONATE_HASHES.donationWallet);
  }
}

async function unlockStoredWallet(password) {
  const storedWallet = getStoredWallet();

  if (!storedWallet) {
    showSection("onboarding");
    return;
  }

  if (!isStoredWalletCompatible(storedWallet)) {
    setMessage(
      `This donation wallet was saved for ${storedWallet.network}. Switch the backend network back or delete the saved wallet first.`,
      "error"
    );
    showSection("locked");
    window.history.replaceState(null, "", DONATE_HASHES.unlockWallet);
    return;
  }

  try {
    setMessage("", "");
    const mnemonic = await decryptMnemonic(storedWallet, password);

    if (!validateMnemonic(mnemonic, wordlist)) {
      throw new Error("The saved mnemonic could not be validated.");
    }

    const wallet = deriveWallet(mnemonic);
    unlockedWalletState = wallet;
    await renderUnlockedWallet(wallet.address);
  } catch {
    setMessage("Unable to unlock the donation wallet with that password.", "error");
    showSection("locked");
  }
}

function renderLockedState() {
  const deleteButton = $("[data-delete-wallet]");
  const addressNode = $("[data-locked-address]");
  const storedWallet = getStoredWallet();

  if (addressNode) {
    addressNode.textContent = storedWallet?.address ?? "";
  }

  if (deleteButton) {
    deleteButton.hidden = appConfig?.network !== "regtest";
  }

  if (storedWallet && !isStoredWalletCompatible(storedWallet)) {
    setMessage(
      `This donation wallet was saved for ${storedWallet.network}. Switch the backend network back or delete the saved wallet first.`,
      "error"
    );
  } else {
    setMessage("", "");
  }

  showSection("locked");
  window.history.replaceState(null, "", DONATE_HASHES.unlockWallet);
}

function applyHashRoute() {
  const hash = getCurrentHash();
  const hasStoredWallet = Boolean(getStoredWallet());
  const hasPendingMnemonic = Boolean(pendingMnemonic);

  if (hash === DONATE_HASHES.importWallet) {
    setMessage("", "");
    showSection("import");
    return;
  }

  if (hash === DONATE_HASHES.createPassword) {
    if (!hasPendingMnemonic) {
      setHash(DONATE_HASHES.onboarding);
      return;
    }

    showCreateWalletStep("password");
    return;
  }

  if (hash === DONATE_HASHES.createMnemonic) {
    if (!hasPendingMnemonic) {
      setHash(DONATE_HASHES.onboarding);
      return;
    }

    showCreateWalletStep("mnemonic");
    return;
  }

  if (hash === DONATE_HASHES.createWords) {
    if (!hasPendingMnemonic) {
      setHash(DONATE_HASHES.onboarding);
      return;
    }

    showCreateWalletStep("words");
    return;
  }

  if (hash === DONATE_HASHES.unlockWallet || hash === DONATE_HASHES.donationWallet) {
    if (hasStoredWallet) {
      renderLockedState();
      return;
    }

    setHash(DONATE_HASHES.onboarding);
    return;
  }

  if (hasStoredWallet) {
    renderLockedState();
    return;
  }

  setMessage("", "");
  showSection("onboarding");
}

export async function initDonatePage() {
  const configResult = await getAppConfig();

  if (!configResult.ok) {
    setMessage("Unable to load app configuration.", "error");
    showSection("onboarding");
    return;
  }

  appConfig = configResult.data;

  const createButton = $("[data-create-wallet]");
  const revealImportButton = $("[data-show-import]");
  const importButton = $("[data-import-wallet]");
  const importCancelButton = $("[data-import-cancel]");
  const unlockButton = $("[data-unlock-wallet]");
  const saveButton = $("[data-save-wallet]");
  const confirmNextButton = $("[data-confirm-next]");
  const mnemonicNextButton = $("[data-mnemonic-next]");
  const confirmBackButtons = document.querySelectorAll("[data-confirm-back]");
  const confirmCancelButton = $("[data-confirm-cancel]");
  const lockButton = $("[data-lock-wallet]");
  const deleteButton = $("[data-delete-wallet]");
  const startButton = $("[data-start-donations]");
  const stopButton = $("[data-stop-donations]");
  const editMaxRequestsButton = $("[data-edit-max-requests]");
  const saveMaxRequestsButton = $("[data-save-max-requests]");
  const editFeeRateButton = $("[data-edit-fee-rate]");
  const saveFeeRateButton = $("[data-save-fee-rate]");
  const activityPrevButton = $("[data-wallet-activity-prev]");
  const activityNextButton = $("[data-wallet-activity-next]");
  const sendButton = $("[data-send-wallet]");
  const sendAddressInput = $("[data-send-address]");
  const sendAmountInput = $("[data-send-amount]");
  const passwordInput = $("[data-wallet-password]");
  const confirmPasswordInput = $("[data-wallet-password-confirm]");
  const importMnemonicInput = $("[data-import-mnemonic]");
  const unlockPasswordInput = $("[data-unlock-password]");

  passwordInput?.addEventListener("input", syncPasswordStepState);
  confirmPasswordInput?.addEventListener("input", syncPasswordStepState);
  passwordInput?.addEventListener("keydown", handlePasswordStepSubmit);
  confirmPasswordInput?.addEventListener("keydown", handlePasswordStepSubmit);
  importMnemonicInput?.addEventListener("keydown", (event) =>
    handleEnterSubmit(event, "[data-import-wallet]")
  );
  unlockPasswordInput?.addEventListener("keydown", (event) =>
    handleEnterSubmit(event, "[data-unlock-wallet]")
  );

  createButton?.addEventListener("click", () => {
    prepareMnemonicFlow(generateMnemonic(wordlist, 128));
  });

  revealImportButton?.addEventListener("click", () => {
    setHash(DONATE_HASHES.importWallet);
  });

  importButton?.addEventListener("click", () => {
    const mnemonic = String($("[data-import-mnemonic]")?.value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (!validateMnemonic(mnemonic, wordlist)) {
      setMessage("Please enter a valid BIP39 mnemonic phrase.", "error");
      return;
    }

    prepareMnemonicFlow(mnemonic);
  });

  importCancelButton?.addEventListener("click", () => {
    setHash(DONATE_HASHES.onboarding);
  });

  confirmNextButton?.addEventListener("click", () => {
    if (!validatePendingPassword()) {
      return;
    }

    setMessage("", "");
    setHash(DONATE_HASHES.createMnemonic);
  });

  mnemonicNextButton?.addEventListener("click", () => {
    setMessage("", "");
    setHash(DONATE_HASHES.createWords);
  });

  for (const button of confirmBackButtons) {
    button.addEventListener("click", () => {
      if (confirmationStep === "words") {
        setHash(DONATE_HASHES.createMnemonic);
        return;
      }

      setHash(DONATE_HASHES.createPassword);
    });
  }

  confirmCancelButton?.addEventListener("click", () => {
    pendingMnemonic = "";
    confirmationIndexes = [];
    clearUnlockedWalletRuntime();
    setMessage("", "");
    setHash(DONATE_HASHES.onboarding);
  });

  unlockButton?.addEventListener("click", async () => {
    const password = String($("[data-unlock-password]")?.value ?? "");
    setMessage("", "");
    await unlockStoredWallet(password);
  });

  saveButton?.addEventListener("click", async () => {
    await saveWalletFromPendingMnemonic();
  });

  editMaxRequestsButton?.addEventListener("click", () => {
    setMaxRequestsEditing(true);
  });

  saveMaxRequestsButton?.addEventListener("click", () => {
    const maxRequestsPerTx = getMaxRequestsPerTx();
    updateStoredWallet({ maxRequestsPerTx });
    setMaxRequestsInputValue(maxRequestsPerTx);
    setMaxRequestsEditing(false);
  });

  editFeeRateButton?.addEventListener("click", () => {
    setFeeRateEditing(true);
  });

  saveFeeRateButton?.addEventListener("click", () => {
    const feeRateSatPerVbyte = getFeeRateSatPerVbyte();
    updateStoredWallet({ feeRateSatPerVbyte });
    setFeeRateInputValue(feeRateSatPerVbyte);
    setFeeRateEditing(false);
  });

  activityPrevButton?.addEventListener("click", () => {
    if (walletActivityPage <= 1) {
      return;
    }

    walletActivityPage -= 1;
    renderWalletActivityTable();
  });

  activityNextButton?.addEventListener("click", () => {
    const totalPages = Math.max(
      Math.ceil(walletActivityItems.length / WALLET_ACTIVITY_PAGE_SIZE),
      1
    );

    if (walletActivityPage >= totalPages) {
      return;
    }

    walletActivityPage += 1;
    renderWalletActivityTable();
  });

  startButton?.addEventListener("click", () => {
    setMessage("", "");
    setMaxRequestsEditing(false);
    startDonationLoop();
  });

  stopButton?.addEventListener("click", () => {
    stopDonationLoop();
  });

  sendAddressInput?.addEventListener("keydown", (event) =>
    handleEnterSubmit(event, "[data-send-wallet]")
  );
  sendAmountInput?.addEventListener("keydown", (event) =>
    handleEnterSubmit(event, "[data-send-wallet]")
  );

  sendButton?.addEventListener("click", async () => {
    const destinationAddress = String(sendAddressInput?.value ?? "").trim();
    const amountSats = Number(sendAmountInput?.value ?? 0);

    setSendStatus("", "");

    if (!unlockedWalletState) {
      setSendStatus("Unlock the donation wallet first.", "error");
      return;
    }

    if (
      !isLikelyAddressForNetwork(destinationAddress, appConfig?.network ?? "mainnet")
    ) {
      setSendStatus("Enter a valid address for the current network.", "error");
      return;
    }

    if (!Number.isInteger(amountSats) || amountSats <= 0) {
      setSendStatus("Enter a valid amount in sats.", "error");
      return;
    }

    sendButton.disabled = true;

    try {
      const transaction = await buildSendTransaction(destinationAddress, amountSats);
      const result = await sendDonationTransaction(
        unlockedWalletState.address,
        transaction.rawTransactionHex
      );

      if (!result.ok) {
        setSendStatus("The transaction could not be broadcast.", "error");
        return;
      }

      setSendStatus(`Sent. ${result.data?.txid ?? ""}`, "success");

      if (sendAddressInput) {
        sendAddressInput.value = "";
      }

      if (sendAmountInput) {
        sendAmountInput.value = "";
      }

      await Promise.all([
        updateWalletBalance(unlockedWalletState.address),
        renderWalletActivity(unlockedWalletState.address)
      ]);
    } catch (error) {
      setSendStatus(
        error instanceof Error ? error.message : "Unable to send from this wallet.",
        "error"
      );
    } finally {
      sendButton.disabled = false;
    }
  });

  lockButton?.addEventListener("click", () => {
    const unlockInput = $("[data-unlock-password]");

    if (unlockInput) {
      unlockInput.value = "";
    }

    stopDonationLoop();
    clearUnlockedWalletRuntime();
    renderLockedState();
  });

  deleteButton?.addEventListener("click", () => {
    if (appConfig?.network !== "regtest") {
      return;
    }

    stopDonationLoop();
    clearWallet();
    pendingMnemonic = "";
    confirmationIndexes = [];
    clearUnlockedWalletRuntime();
    setMessage("", "");
    setHash(DONATE_HASHES.onboarding);
  });

  window.addEventListener("hashchange", applyHashRoute);
  window.addEventListener("beforeunload", () => {
    clearScheduledCycle();
    clearWalletAutoRefresh();
  });
  applyHashRoute();
}
