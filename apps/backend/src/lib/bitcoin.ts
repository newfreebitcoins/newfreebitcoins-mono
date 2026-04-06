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
