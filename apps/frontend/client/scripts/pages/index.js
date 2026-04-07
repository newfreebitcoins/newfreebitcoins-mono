import { getFaucetTotalBtc } from "../api.js";
import { formatCoinAmount, getRuntimeAppConfig } from "../consts.js";

function updateTotalBtcText(totalBtc) {
  const nodes = document.querySelectorAll("[data-total-btc]");

  for (const node of nodes) {
    node.textContent = `${formatCoinAmount(totalBtc)} available`;
  }
}

function formatSatsLabel(amountSats) {
  const numericAmount = Number(amountSats);

  if (!Number.isFinite(numericAmount)) {
    return "2,500 satoshis";
  }

  const suffix = numericAmount === 1 ? "satoshi" : "satoshis";
  return `${numericAmount.toLocaleString()} ${suffix}`;
}

function hydrateFaucetAmountCopy() {
  const faucetConfig = getRuntimeAppConfig()?.faucet;
  const amountBtcNodes = document.querySelectorAll("[data-faucet-request-amount-btc]");
  const amountSatsNodes = document.querySelectorAll("[data-faucet-request-amount-sats]");
  const amountBtc =
    faucetConfig?.requestAmountBtc != null
      ? formatCoinAmount(faucetConfig.requestAmountBtc)
      : "0.00002500 BTC";
  const amountSats = formatSatsLabel(faucetConfig?.requestAmountSats);

  for (const node of amountBtcNodes) {
    node.textContent = amountBtc;
  }

  for (const node of amountSatsNodes) {
    node.textContent = amountSats;
  }
}

export async function initIndexPage() {
  hydrateFaucetAmountCopy();
  const totalBtc = await getFaucetTotalBtc();
  updateTotalBtcText(totalBtc);
}
