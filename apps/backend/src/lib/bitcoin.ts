import { address as bitcoinAddress, networks } from "bitcoinjs-lib";
import { loadConfig } from "../config.js";

export function getBitcoinNetwork() {
  const config = loadConfig();
  return config.network === "mainnet" ? networks.bitcoin : networks.regtest;
}

export function getCurrencyCode() {
  const config = loadConfig();
  return config.network === "mainnet" ? "BTC" : "rBTC";
}

export function isValidBitcoinAddress(value: string): boolean {
  try {
    bitcoinAddress.toOutputScript(value, getBitcoinNetwork());
    return true;
  } catch {
    return false;
  }
}

export function parseBtcAmountToSats(value: string): number {
  const trimmed = String(value ?? "").trim();

  if (!/^\d+(?:\.\d{1,8})?$/.test(trimmed)) {
    throw new Error("invalid_btc_amount");
  }

  const [wholePart, fractionalPart = ""] = trimmed.split(".");
  const normalizedFractional = `${fractionalPart}00000000`.slice(0, 8);

  return Number(BigInt(wholePart) * 100_000_000n + BigInt(normalizedFractional));
}
