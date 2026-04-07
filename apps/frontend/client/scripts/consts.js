import { CLIENT_CONFIG } from "./config.js";

export const BACKEND_ENDPOINT = CLIENT_CONFIG.backendEndpoint;

export const NETWORK_CONFIG = {
  mainnet: {
    label: "Mainnet",
    bip84CoinType: 0
  },
  regtest: {
    label: "Regtest",
    bip84CoinType: 1
  }
};

export function getRuntimeAppConfig() {
  return window.__APP_CONFIG__ ?? null;
}

export function getCurrencyCode() {
  return getRuntimeAppConfig()?.unitLabel ?? "BTC";
}

export function formatSatsAsCoins(sats) {
  return `${(Number(sats ?? 0) / 100000000).toFixed(8)} ${getCurrencyCode()}`;
}

export function formatCoinAmount(value) {
  return `${value} ${getCurrencyCode()}`;
}

export function isLikelyAddressForNetwork(value, network) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return false;
  }

  if (network === "regtest") {
    return /^(bcrt1|[mn2])[a-zA-HJ-NP-Z0-9]{20,90}$/.test(trimmed);
  }

  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,90}$/.test(trimmed);
}
