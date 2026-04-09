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
  getDonationChallenge,
  getDonorStatus,
  getRuntimeConfig,
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

const STORAGE_KEY_PREFIX = "donationWallet";
const LEGACY_STORAGE_KEY = STORAGE_KEY_PREFIX;
const DUST_THRESHOLD = 546;
const WALLET_AUTO_REFRESH_MS = 10000;
const SEND_REFETCH_DELAY_MS = 1500;
const GRAFFITI_MAX_LENGTH = 80;
const DONATION_HEARTBEAT_CONTEXT = "new-free-bitcoins-donation-heartbeat";
const MAX_FEE_RATE_SAT_PER_VBYTE = 500;

window.Buffer ??= Buffer;

let appConfig = null;
let pendingMnemonic = "";
let pendingWalletMode = "create";
let confirmationIndexes = [];
let confirmationStep = "password";
let unlockedWalletState = null;
let donorStatusState = null;
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
let walletDataRefetchTimeoutId = null;

const WALLET_ACTIVITY_PAGE_SIZE = 8;

const DONATE_HASHES = {
  onboarding: "#donate",
  importWallet: "#import-wallet",
  importPassword: "#import-wallet-password",
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

function readStoredWallet(key) {
  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getCurrentNetwork() {
  return appConfig?.network ?? "mainnet";
}

function getStorageKey(network = getCurrentNetwork()) {
  return `${STORAGE_KEY_PREFIX}:${network}`;
}

function getStoredWalletForNetwork(network) {
  return readStoredWallet(getStorageKey(network));
}

function getLegacyStoredWallet() {
  return readStoredWallet(LEGACY_STORAGE_KEY);
}

function getStoredWallet() {
  return getStoredWalletForNetwork(getCurrentNetwork());
}

function getUnlockSourceWalletInfo() {
  const currentNetwork = getCurrentNetwork();
  const currentWallet = getStoredWalletForNetwork(currentNetwork);

  if (currentWallet) {
    return {
      wallet: currentWallet,
      key: getStorageKey(currentNetwork),
      isCurrentNetwork: true
    };
  }

  const legacyWallet = getLegacyStoredWallet();

  if (legacyWallet) {
    return {
      wallet: legacyWallet,
      key: LEGACY_STORAGE_KEY,
      isCurrentNetwork: legacyWallet.network === currentNetwork
    };
  }

  for (const network of Object.keys(NETWORK_CONFIG)) {
    if (network === currentNetwork) {
      continue;
    }

    const wallet = getStoredWalletForNetwork(network);

    if (wallet) {
      return {
        wallet,
        key: getStorageKey(network),
        isCurrentNetwork: false
      };
    }
  }

  return {
    wallet: null,
    key: "",
    isCurrentNetwork: false
  };
}

function storeWallet(payload, network = getCurrentNetwork()) {
  window.localStorage.setItem(getStorageKey(network), JSON.stringify(payload));
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
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);

  for (const network of Object.keys(NETWORK_CONFIG)) {
    window.localStorage.removeItem(getStorageKey(network));
  }
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
  const graffiti = String(getStoredWallet()?.graffiti ?? "").trim();
  const payload = new TextEncoder().encode(
    `${DONATION_HEARTBEAT_CONTEXT}\0${challengeHex}\0${graffiti}`
  );
  const digest = await crypto.subtle.digest("SHA-256", payload);
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

function clearWalletDataRefetchTimeout() {
  if (walletDataRefetchTimeoutId) {
    window.clearTimeout(walletDataRefetchTimeoutId);
    walletDataRefetchTimeoutId = null;
  }
}

function formatSatsAsBtcValue(sats) {
  return (Number(sats ?? 0) / 100000000).toFixed(8);
}

function parseBtcAmountToSats(value) {
  const trimmed = String(value ?? "").trim();

  if (!/^\d+(?:\.\d{1,8})?$/.test(trimmed)) {
    return null;
  }

  const [wholePart, fractionalPart = ""] = trimmed.split(".");
  const normalizedFractional = `${fractionalPart}00000000`.slice(0, 8);

  return Number(BigInt(wholePart) * 100000000n + BigInt(normalizedFractional));
}

function normalizeMnemonicInput(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function parseFeeRateSatPerVbyte(value) {
  const trimmed = String(value ?? "").trim();

  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0 ||
    parsed > MAX_FEE_RATE_SAT_PER_VBYTE
  ) {
    return null;
  }

  return parsed;
}

function getDefaultFeeRateSatPerVbyte() {
  const configured = Number(
    getStoredWallet()?.feeRateSatPerVbyte ?? appConfig?.donations?.feeRateSatPerVbyte ?? 2
  );

  if (
    Number.isFinite(configured) &&
    configured > 0 &&
    configured <= MAX_FEE_RATE_SAT_PER_VBYTE
  ) {
    return configured;
  }

  return 2;
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
  const fallback = getDefaultFeeRateSatPerVbyte();

  if (!input) {
    return fallback;
  }

  return parseFeeRateSatPerVbyte(input.value) ?? fallback;
}

function getValidatedFeeRateSatPerVbyte() {
  const input = $("[data-fee-rate-input]");
  return parseFeeRateSatPerVbyte(input?.value ?? "");
}

function getSendAmountSats() {
  const input = $("[data-send-amount]");
  return parseBtcAmountToSats(String(input?.value ?? ""));
}

function getGraffitiValue() {
  const input = $("[data-graffiti-input]");
  const fallback = String(getStoredWallet()?.graffiti ?? "").trim();

  if (!input) {
    return fallback;
  }

  return String(input.value ?? fallback).trim();
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
    input.value = String(parseFeeRateSatPerVbyte(value) ?? getDefaultFeeRateSatPerVbyte());
  }
}

function setGraffitiInputValue(value) {
  const input = $("[data-graffiti-input]");

  if (input) {
    input.value = String(value ?? "").trim();
  }
}

function setSendAmountInputValueFromSats(sats) {
  const input = $("[data-send-amount]");

  if (input) {
    input.value = formatSatsAsBtcValue(sats);
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

function setGraffitiEditing(isEditing) {
  const input = $("[data-graffiti-input]");
  const editButton = $("[data-edit-graffiti]");
  const saveButton = $("[data-save-graffiti]");

  if (input) {
    input.disabled = !isEditing;
  }

  if (editButton) {
    editButton.disabled = isEditing;
  }

  if (saveButton) {
    saveButton.hidden = !isEditing;
  }
}

function setSendStatus(text, type = "") {
  const node = $("[data-send-status]");

  if (!node) {
    return;
  }

  node.className = "";
  node.textContent = text;
  node.dataset.messageType = type;
}

function setSendStatusWithTxLink(message, txid, explorerUrl) {
  const node = $("[data-send-status]");

  if (!node) {
    return;
  }

  node.dataset.messageType = "success";
  node.className = "request-success";
  node.textContent = `${message} `;

  if (!explorerUrl || !txid) {
    node.textContent = message;
    return;
  }

  const link = document.createElement("a");
  link.href = explorerUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = txid;
  node.appendChild(link);
}

function isSendFormValid() {
  const destinationAddress = String($("[data-send-address]")?.value ?? "").trim();
  const amountSats = getSendAmountSats();
  const feeRate = getValidatedFeeRateSatPerVbyte();

  if (!unlockedWalletState) {
    return false;
  }

  if (!isLikelyAddressForNetwork(destinationAddress, appConfig?.network ?? "mainnet")) {
    return false;
  }

  if (!Number.isInteger(amountSats) || Number(amountSats) <= 0) {
    return false;
  }

  return feeRate != null;
}

function updateSendControls() {
  const sendButton = $("[data-send-wallet]");
  const maxButton = $("[data-send-max]");

  if (sendButton) {
    sendButton.disabled = !isSendFormValid();
  }

  if (maxButton) {
    maxButton.disabled = !unlockedWalletState || getValidatedFeeRateSatPerVbyte() == null;
  }
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
    startButton.disabled = isRunning || Boolean(getDonorStatusMessage(donorStatusState));
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

  updateSendControls();
}

function updateGraffitiThresholdNote() {
  const node = $("[data-graffiti-threshold]");
  const minimumGraffitiBtc = String(appConfig?.donations?.minimumGraffitiBtc ?? "").trim();

  if (node) {
    node.textContent = minimumGraffitiBtc
      ? `${minimumGraffitiBtc} ${getCoinLabel()}`
      : "the configured minimum";
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

function getDonorStatusMessage(status) {
  if (!status) {
    return "";
  }

  if (status.isBlacklisted) {
    return `This donor is blacklisted at reputation ${status.minimumReputationNeeded}.`;
  }

  if (
    Number(status.confirmedBalanceSats ?? 0) <
    Number(status.minSatsForHeartbeat ?? 0)
  ) {
    return `At least ${formatSatsAsCoins(status.minSatsForHeartbeat ?? 0)} confirmed ${getCoinLabel()} is required to heartbeat.`;
  }

  return "";
}

function renderDonorStatus(status) {
  donorStatusState = status ?? null;
  const reputationNode = $("[data-donor-reputation]");
  const startButton = $("[data-start-donations]");

  if (reputationNode) {
    reputationNode.textContent =
      status == null ? "Unknown" : String(status.reputation ?? 0);
  }

  if (startButton && !donationRuntimeState.enabled) {
    startButton.disabled = Boolean(getDonorStatusMessage(status));
  }
}

function getMaxReservableRequestsFromStatus(status = donorStatusState) {
  const requestAmountSats = Number(appConfig?.faucet?.requestAmountSats ?? 0);
  const availableReserveCapacitySats = Number(
    status?.availableReserveCapacitySats ?? 0
  );

  if (requestAmountSats <= 0 || availableReserveCapacitySats <= 0) {
    return 0;
  }

  return Math.max(
    Math.floor(availableReserveCapacitySats / requestAmountSats),
    0
  );
}

async function updateDonorStatus(address) {
  const result = await getDonorStatus(address);

  if (!result.ok) {
    renderDonorStatus(null);
    return {
      ok: false,
      error: result.error
    };
  }

  renderDonorStatus(result.data ?? null);

  return {
    ok: true,
    data: result.data ?? null
  };
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

  walletActivityItems = [...result.data.items].sort((left, right) => {
    const leftPending = !left?.occurredAt;
    const rightPending = !right?.occurredAt;

    if (leftPending !== rightPending) {
      return leftPending ? -1 : 1;
    }

    const leftTime = left?.occurredAt ? new Date(left.occurredAt).valueOf() : 0;
    const rightTime = right?.occurredAt ? new Date(right.occurredAt).valueOf() : 0;
    return rightTime - leftTime;
  });
  renderWalletActivityTable();
}

async function refetchWalletData({ followUpMs = 0 } = {}) {
  if (!unlockedWalletState) {
    return;
  }

  await Promise.all([
    updateWalletBalance(unlockedWalletState.address),
    renderWalletActivity(unlockedWalletState.address),
    updateDonorStatus(unlockedWalletState.address)
  ]);

  clearWalletDataRefetchTimeout();

  if (followUpMs > 0) {
    walletDataRefetchTimeoutId = window.setTimeout(() => {
      if (!unlockedWalletState) {
        return;
      }

      void Promise.all([
        updateWalletBalance(unlockedWalletState.address),
        renderWalletActivity(unlockedWalletState.address),
        updateDonorStatus(unlockedWalletState.address)
      ]);
    }, followUpMs);
  }
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

  const continueButton = $("[data-confirm-next]");

  if (continueButton) {
    continueButton.textContent =
      pendingWalletMode === "create" ? "Continue" : "Import Donation Wallet";
  }
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

function syncImportStepState() {
  const mnemonic = normalizeMnemonicInput($("[data-import-mnemonic]")?.value ?? "");
  const continueButton = $("[data-import-wallet]");

  if (continueButton) {
    continueButton.disabled = !validateMnemonic(mnemonic, wordlist);
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

function prepareMnemonicFlow(mnemonic, mode = "create") {
  pendingMnemonic = normalizeMnemonicInput(mnemonic);
  pendingWalletMode = mode;
  confirmationIndexes =
    mode === "create"
      ? createRandomConfirmationIndexes(pendingMnemonic.split(/\s+/).length)
      : [];

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

  if (mode === "create") {
    renderMnemonicWords();
    renderConfirmationPrompts();
  }
  syncPasswordStepState();
  setMessage("", "");
  setHash(mode === "create" ? DONATE_HASHES.createPassword : DONATE_HASHES.importPassword);
}

function clearUnlockedWalletRuntime() {
  clearScheduledCycle();
  clearWalletAutoRefresh();
  unlockedWalletState = null;
  donorStatusState = null;
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

  const donorStatusMessage = getDonorStatusMessage(donorStatusState);

  if (donorStatusMessage) {
    setMessage(donorStatusMessage, "error");
    stopDonationLoop();
    return false;
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
    signatureHex,
    graffiti: String(getStoredWallet()?.graffiti ?? "").trim()
  });

  if (!heartbeatResult.ok) {
    const donorStatusResult = await updateDonorStatus(unlockedWalletState.address);
    const nextStatusMessage = donorStatusResult.ok
      ? getDonorStatusMessage(donorStatusResult.data)
      : "";

    setMessage(
      nextStatusMessage || "Unable to prove donation wallet activity right now.",
      "error"
    );

    if (nextStatusMessage) {
      stopDonationLoop();
    }

    return false;
  }

  if (heartbeatResult.data?.donor) {
    renderDonorStatus(heartbeatResult.data.donor);
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

  const feeRate = getValidatedFeeRateSatPerVbyte();

  if (feeRate == null) {
    throw new Error("Enter a valid sats/vbyte fee rate.");
  }

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

async function calculateMaxSendAmountSats() {
  if (!unlockedWalletState) {
    throw new Error("Unlock the donation wallet first.");
  }

  const utxoResult = await getWalletUtxos(unlockedWalletState.address);

  if (!utxoResult.ok) {
    throw new Error("Unable to load donation wallet UTXOs.");
  }

  const confirmedUtxos = [...(utxoResult.data?.utxos ?? [])].filter(
    (utxo) => Number(utxo.height ?? 0) > 0
  );

  if (!confirmedUtxos.length) {
    throw new Error("This donation wallet has no confirmed spendable UTXOs.");
  }

  const feeRate = getValidatedFeeRateSatPerVbyte();

  if (feeRate == null) {
    throw new Error("Enter a valid sats/vbyte fee rate.");
  }

  const totalInputs = confirmedUtxos.reduce(
    (sum, utxo) => sum + Number(utxo.value ?? 0),
    0
  );
  const fee = estimateFee(confirmedUtxos.length, 1, feeRate);
  const maxSendSats = totalInputs - fee;

  if (maxSendSats <= 0) {
    throw new Error("This donation wallet does not have enough confirmed funds to cover the fee.");
  }

  return maxSendSats;
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
    const donorStatusResult = await updateDonorStatus(unlockedWalletState.address);

    if (!donorStatusResult.ok) {
      setMessage("Unable to refresh donor reputation right now.", "error");
      renderExecutionStatus("Donation wallet is running...", true);
      return;
    }

    const donorStatusMessage = getDonorStatusMessage(donorStatusResult.data);

    if (donorStatusMessage) {
      setMessage(donorStatusMessage, "error");
      stopDonationLoop();
      return;
    }

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
        void refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });
        renderExecutionStatus(
          `Donation wallet is running... waiting for confirmation on ${donationRuntimeState.pendingTxId.slice(0, 12)}...`,
          true
        );
        return;
      }

      donationRuntimeState.pendingTxId = "";
      await refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });
    }

    const maxReservableRequests = getMaxReservableRequestsFromStatus(donorStatusState);
    const requestedMaxRequests = getMaxRequestsPerTx();
    const reserveRequestCount = Math.min(requestedMaxRequests, maxReservableRequests);

    if (reserveRequestCount <= 0) {
      renderExecutionStatus(
        "Donation wallet is running... waiting for more confirmed balance.",
        true
      );
      return;
    }

    const reserveResult = await reserveDonationRequests(
      unlockedWalletState.address,
      reserveRequestCount
    );

    if (!reserveResult.ok) {
      const nextStatusResult = await updateDonorStatus(unlockedWalletState.address);
      const nextStatusMessage = nextStatusResult.ok
        ? getDonorStatusMessage(nextStatusResult.data)
        : "";
      const reserveMessage =
        reserveResult.error === "donor_promised_balance_exceeded"
          ? "This wallet cannot reserve that many requests with its current confirmed balance."
          : nextStatusMessage || "Unable to reserve faucet requests right now.";

      setMessage(reserveMessage, "error");

      if (nextStatusMessage) {
        stopDonationLoop();
        return;
      }

      renderExecutionStatus("Donation wallet is running...", true);
      return;
    }

    if (reserveResult.data?.donor) {
      renderDonorStatus(reserveResult.data.donor);
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

    await refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });

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

  if (pendingWalletMode === "create" && !validateConfirmationInputs()) {
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
    graffiti: "",
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
  setGraffitiInputValue(storedWallet?.graffiti ?? "");
  setMaxRequestsEditing(false);
  setFeeRateEditing(false);
  setGraffitiEditing(false);
  updateGraffitiThresholdNote();
  renderDonorStatus(null);
  renderExecutionStatus("Donation wallet is stopped.", false);

  await refetchWalletData();

  clearWalletAutoRefresh();
  walletAutoRefreshIntervalId = window.setInterval(() => {
    if (!unlockedWalletState) {
      clearWalletAutoRefresh();
      return;
    }

    void refetchWalletData();
  }, WALLET_AUTO_REFRESH_MS);

  setMessage(getDonorStatusMessage(donorStatusState), getDonorStatusMessage(donorStatusState) ? "error" : "");
  showSection("wallet");

  if (getCurrentHash() !== DONATE_HASHES.donationWallet) {
    window.history.replaceState(null, "", DONATE_HASHES.donationWallet);
  }
}

async function unlockStoredWallet(password) {
  const { wallet: storedWallet } = getUnlockSourceWalletInfo();

  if (!storedWallet) {
    showSection("onboarding");
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
    storeWallet({
      ...storedWallet,
      network: appConfig.network,
      address: wallet.address,
      derivationPath: wallet.derivationPath
    });
    await renderUnlockedWallet(wallet.address);
  } catch {
    setMessage("Unable to unlock the donation wallet with that password.", "error");
    showSection("locked");
  }
}

function renderLockedState() {
  const deleteButton = $("[data-delete-wallet]");
  const addressNode = $("[data-locked-address]");
  const unlockSource = getUnlockSourceWalletInfo();
  const storedWallet = unlockSource.wallet;

  if (addressNode) {
    addressNode.textContent = unlockSource.isCurrentNetwork
      ? storedWallet?.address ?? ""
      : "";
  }

  if (deleteButton) {
    deleteButton.hidden = appConfig?.network !== "regtest";
  }

  if (storedWallet && !unlockSource.isCurrentNetwork) {
    setMessage(
      `Unlock this donation wallet to load its ${NETWORK_CONFIG[appConfig.network].label} address.`,
      ""
    );
  } else {
    setMessage("", "");
  }

  showSection("locked");
  window.history.replaceState(null, "", DONATE_HASHES.unlockWallet);
}

function applyHashRoute() {
  const hash = getCurrentHash();
  const hasStoredWallet = Boolean(getUnlockSourceWalletInfo().wallet);
  const hasPendingMnemonic = Boolean(pendingMnemonic);

  if (hash === DONATE_HASHES.importWallet) {
    setMessage("", "");
    showSection("import");
    syncImportStepState();
    return;
  }

  if (hash === DONATE_HASHES.importPassword) {
    if (!hasPendingMnemonic || pendingWalletMode !== "import") {
      setHash(DONATE_HASHES.importWallet);
      return;
    }

    showCreateWalletStep("password");
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

    if (pendingWalletMode !== "create") {
      setHash(DONATE_HASHES.importPassword);
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

    if (pendingWalletMode !== "create") {
      setHash(DONATE_HASHES.importPassword);
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
  const configResult = await getRuntimeConfig();

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
  const graffitiInput = $("[data-graffiti-input]");
  const editGraffitiButton = $("[data-edit-graffiti]");
  const saveGraffitiButton = $("[data-save-graffiti]");
  const activityPrevButton = $("[data-wallet-activity-prev]");
  const activityNextButton = $("[data-wallet-activity-next]");
  const sendButton = $("[data-send-wallet]");
  const sendMaxButton = $("[data-send-max]");
  const sendAddressInput = $("[data-send-address]");
  const sendAmountInput = $("[data-send-amount]");
  const feeRateInput = $("[data-fee-rate-input]");
  const passwordInput = $("[data-wallet-password]");
  const confirmPasswordInput = $("[data-wallet-password-confirm]");
  const importMnemonicInput = $("[data-import-mnemonic]");
  const unlockPasswordInput = $("[data-unlock-password]");

  passwordInput?.addEventListener("input", syncPasswordStepState);
  confirmPasswordInput?.addEventListener("input", syncPasswordStepState);
  passwordInput?.addEventListener("keydown", handlePasswordStepSubmit);
  confirmPasswordInput?.addEventListener("keydown", handlePasswordStepSubmit);
  importMnemonicInput?.addEventListener("input", syncImportStepState);
  importMnemonicInput?.addEventListener("change", syncImportStepState);
  importMnemonicInput?.addEventListener("keyup", syncImportStepState);
  importMnemonicInput?.addEventListener("paste", () => {
    window.setTimeout(syncImportStepState, 0);
  });
  importMnemonicInput?.addEventListener("keydown", (event) =>
    handleEnterSubmit(event, "[data-import-wallet]")
  );
  unlockPasswordInput?.addEventListener("keydown", (event) =>
    handleEnterSubmit(event, "[data-unlock-wallet]")
  );
  graffitiInput?.addEventListener("keydown", (event) =>
    handleEnterSubmit(event, "[data-save-graffiti]")
  );
  sendAddressInput?.addEventListener("input", updateSendControls);
  sendAmountInput?.addEventListener("input", updateSendControls);
  feeRateInput?.addEventListener("input", updateSendControls);

  createButton?.addEventListener("click", () => {
    prepareMnemonicFlow(generateMnemonic(wordlist, 128), "create");
  });

  revealImportButton?.addEventListener("click", () => {
    setHash(DONATE_HASHES.importWallet);
  });

  importButton?.addEventListener("click", () => {
    const mnemonic = normalizeMnemonicInput($("[data-import-mnemonic]")?.value ?? "");

    if (!validateMnemonic(mnemonic, wordlist)) {
      setMessage("Please enter a valid BIP39 mnemonic phrase.", "error");
      return;
    }

    prepareMnemonicFlow(mnemonic, "import");
  });

  importCancelButton?.addEventListener("click", () => {
    setHash(DONATE_HASHES.onboarding);
  });

  confirmNextButton?.addEventListener("click", async () => {
    if (!validatePendingPassword()) {
      return;
    }

    if (pendingWalletMode !== "create") {
      await saveWalletFromPendingMnemonic();
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

      setHash(
        pendingWalletMode === "create"
          ? DONATE_HASHES.createPassword
          : DONATE_HASHES.importWallet
      );
    });
  }

  confirmCancelButton?.addEventListener("click", () => {
    pendingMnemonic = "";
    pendingWalletMode = "create";
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
    updateSendControls();
  });

  editGraffitiButton?.addEventListener("click", () => {
    setGraffitiEditing(true);
  });

  saveGraffitiButton?.addEventListener("click", () => {
    const graffiti = getGraffitiValue();

    if ([...graffiti].length > GRAFFITI_MAX_LENGTH) {
      setMessage(`Graffiti must be ${GRAFFITI_MAX_LENGTH} characters or fewer.`, "error");
      return;
    }

    updateStoredWallet({ graffiti });
    setGraffitiInputValue(graffiti);
    setGraffitiEditing(false);

    if (donationRuntimeState.enabled) {
      donationRuntimeState.lastHeartbeatAt = 0;
    }

    setMessage("", "");
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

  sendMaxButton?.addEventListener("click", async () => {
    setSendStatus("", "");

    try {
      const maxSendSats = await calculateMaxSendAmountSats();
      setSendAmountInputValueFromSats(maxSendSats);
      updateSendControls();
      await refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });
    } catch (error) {
      setSendStatus(
        error instanceof Error ? error.message : "Unable to calculate the max send amount.",
        "error"
      );
    }
  });

  sendButton?.addEventListener("click", async () => {
    const destinationAddress = String(sendAddressInput?.value ?? "").trim();
    const amountSats = getSendAmountSats();

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

    if (!Number.isInteger(amountSats) || Number(amountSats) <= 0) {
      setSendStatus(`Enter a valid amount in ${getCoinLabel()}.`, "error");
      return;
    }

    if (getValidatedFeeRateSatPerVbyte() == null) {
      setSendStatus("Enter a valid sats/vbyte fee rate.", "error");
      return;
    }

    sendButton.disabled = true;

    if (sendMaxButton) {
      sendMaxButton.disabled = true;
    }

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

      setSendStatusWithTxLink(
        "Sent.",
        String(result.data?.txid ?? ""),
        result.data?.explorerUrl ?? ""
      );

      if (sendAddressInput) {
        sendAddressInput.value = "";
      }

      if (sendAmountInput) {
        sendAmountInput.value = "";
      }

      updateSendControls();
      await refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });
    } catch (error) {
      setSendStatus(
        error instanceof Error ? error.message : "Unable to send from this wallet.",
        "error"
      );
    } finally {
      updateSendControls();
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
    pendingWalletMode = "create";
    confirmationIndexes = [];
    clearUnlockedWalletRuntime();
    setMessage("", "");
    setHash(DONATE_HASHES.onboarding);
  });

  window.addEventListener("hashchange", applyHashRoute);
  window.addEventListener("beforeunload", () => {
    clearScheduledCycle();
    clearWalletAutoRefresh();
    clearWalletDataRefetchTimeout();
  });
  syncImportStepState();
  updateSendControls();
  applyHashRoute();
}
