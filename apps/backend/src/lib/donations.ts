import crypto from "node:crypto";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { payments, networks } from "bitcoinjs-lib";
import { loadConfig } from "../config.js";
import { parseBtcAmountToSats } from "./bitcoin.js";
import { getAddressBalance } from "./esplora.js";

interface DonationChallengeState {
  challengeHex: string;
  issuedAt: number;
  expiresAt: number;
}

interface ActiveDonationWallet {
  address: string;
  publicKeyHex: string;
  lastHeartbeatAt: number;
  balanceSats: number;
  unconfirmedBalanceSats: number;
  graffiti: string;
}

const config = loadConfig();
const DONATION_HEARTBEAT_CONTEXT = "new-free-bitcoins-donation-heartbeat";
const MAX_GRAFFITI_LENGTH = 80;
const minimumGraffitiSats = parseBtcAmountToSats(config.donations.minimumGraffitiBtc);

let currentChallenge = createChallenge();
const activeWallets = new Map<string, ActiveDonationWallet>();
let totalActiveBalanceSats = 0;

function getBitcoinNetwork() {
  return config.network === "mainnet" ? networks.bitcoin : networks.regtest;
}

function createChallenge(): DonationChallengeState {
  const issuedAt = Date.now();
  return {
    challengeHex: crypto.randomBytes(32).toString("hex"),
    issuedAt,
    expiresAt: issuedAt + config.donations.challengeRotationMs
  };
}

function normalizeDonationGraffiti(value: string): string {
  const normalized = String(value ?? "").trim();

  if ([...normalized].length > MAX_GRAFFITI_LENGTH) {
    throw new Error("invalid_donation_graffiti");
  }

  return normalized;
}

export type ValidDonationHeartbeat = {
  address: string;
  publicKeyHex: string;
  graffiti: string;
  balanceSats?: number;
  unconfirmedBalanceSats?: number;
};

function getHeartbeatMessageHash(challengeHex: string, graffiti: string): Uint8Array {
  return crypto
    .createHash("sha256")
    .update(DONATION_HEARTBEAT_CONTEXT, "utf8")
    .update("\0", "utf8")
    .update(challengeHex, "utf8")
    .update("\0", "utf8")
    .update(graffiti, "utf8")
    .digest();
}

function getAddressFromPublicKey(publicKeyHex: string): string {
  const payment = payments.p2wpkh({
    pubkey: Buffer.from(publicKeyHex, "hex"),
    network: getBitcoinNetwork()
  });

  if (!payment.address) {
    throw new Error("unable_to_derive_address_from_public_key");
  }

  return payment.address;
}

function pruneInactiveWallets() {
  const cutoff = Date.now() - config.donations.activeWindowMs;

  for (const [address, wallet] of activeWallets.entries()) {
    if (wallet.lastHeartbeatAt < cutoff) {
      activeWallets.delete(address);
    }
  }
}

async function refreshActiveWalletBalances() {
  pruneInactiveWallets();

  const wallets = [...activeWallets.values()];
  const balanceResults = await Promise.allSettled(
    wallets.map(async (wallet) => ({
      address: wallet.address,
      balance: await getAddressBalance(wallet.address)
    }))
  );

  let nextTotal = 0;

  for (const result of balanceResults) {
    if (result.status !== "fulfilled") {
      continue;
    }

    const activeWallet = activeWallets.get(result.value.address);

    if (!activeWallet) {
      continue;
    }

    const confirmed = Number(result.value.balance.confirmed ?? 0);
    const unconfirmed = Number(result.value.balance.unconfirmed ?? 0);
    const spendableConfirmed = Math.max(confirmed, 0);

    activeWallet.balanceSats = spendableConfirmed;
    activeWallet.unconfirmedBalanceSats = Math.max(unconfirmed, 0);
    nextTotal += spendableConfirmed;
  }

  totalActiveBalanceSats = nextTotal;
}

function rotateChallenge() {
  currentChallenge = createChallenge();
}

export function getDonationChallenge() {
  return {
    challenge: currentChallenge.challengeHex,
    issuedAt: currentChallenge.issuedAt,
    expiresAt: currentChallenge.expiresAt,
    heartbeatPollMs: config.donations.heartbeatPollMs
  };
}

export function getDonationBalanceCache() {
  pruneInactiveWallets();

  return {
    totalActiveBalanceSats,
    totalBtc: (totalActiveBalanceSats / 100_000_000).toFixed(8),
    activeWalletCount: activeWallets.size
  };
}

export function isDonationWalletActive(address: string): boolean {
  pruneInactiveWallets();
  return activeWallets.has(address);
}

export function getActiveDonationWalletsPage(page: number, pageSize: number) {
  pruneInactiveWallets();

  const wallets = [...activeWallets.values()]
    .sort((left, right) => {
      if (right.balanceSats !== left.balanceSats) {
        return right.balanceSats - left.balanceSats;
      }

      return right.lastHeartbeatAt - left.lastHeartbeatAt;
    })
    .map((wallet) => ({
      address: wallet.address,
      balanceSats: wallet.balanceSats,
      balanceBtc: (wallet.balanceSats / 100_000_000).toFixed(8),
      unconfirmedBalanceSats: wallet.unconfirmedBalanceSats,
      unconfirmedBalanceBtc: (
        wallet.unconfirmedBalanceSats / 100_000_000
      ).toFixed(8),
      lastHeartbeatAt: wallet.lastHeartbeatAt,
      graffiti:
        wallet.balanceSats >= minimumGraffitiSats && wallet.graffiti
          ? wallet.graffiti
          : null
    }));

  const totalCount = wallets.length;
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const normalizedPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (normalizedPage - 1) * pageSize;

  return {
    page: normalizedPage,
    pageSize,
    totalCount,
    totalPages,
    wallets: wallets.slice(offset, offset + pageSize)
  };
}

export function validateDonationHeartbeat(input: {
  address: string;
  publicKeyHex: string;
  challenge: string;
  signatureHex: string;
  graffiti?: string;
}): ValidDonationHeartbeat {
  pruneInactiveWallets();
  const graffiti = normalizeDonationGraffiti(input.graffiti ?? "");

  if (input.challenge !== currentChallenge.challengeHex) {
    throw new Error("stale_or_invalid_donation_challenge");
  }

  const derivedAddress = getAddressFromPublicKey(input.publicKeyHex);

  if (derivedAddress !== input.address) {
    throw new Error("donation_public_key_does_not_match_address");
  }

  const signature = Buffer.from(input.signatureHex, "hex");
  const isValid = secp256k1.verify(
    signature,
    getHeartbeatMessageHash(input.challenge, graffiti),
    Buffer.from(input.publicKeyHex, "hex"),
    { prehash: false }
  );

  if (!isValid) {
    throw new Error("invalid_donation_signature");
  }

  return {
    address: input.address,
    publicKeyHex: input.publicKeyHex,
    graffiti
  };
}

export function recordDonationHeartbeat(input: ValidDonationHeartbeat) {
  const existing = activeWallets.get(input.address);

  activeWallets.set(input.address, {
    address: input.address,
    publicKeyHex: input.publicKeyHex,
    lastHeartbeatAt: Date.now(),
    balanceSats: Number(input.balanceSats ?? existing?.balanceSats ?? 0),
    unconfirmedBalanceSats: Number(
      input.unconfirmedBalanceSats ?? existing?.unconfirmedBalanceSats ?? 0
    ),
    graffiti: input.graffiti
  });

  return getDonationBalanceCache();
}

export async function startDonationRuntime() {
  rotateChallenge();
  await refreshActiveWalletBalances();

  setInterval(() => {
    rotateChallenge();
    pruneInactiveWallets();
  }, config.donations.challengeRotationMs).unref();

  setInterval(() => {
    void refreshActiveWalletBalances();
  }, config.donations.balanceRefreshMs).unref();
}
