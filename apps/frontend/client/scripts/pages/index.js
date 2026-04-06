import { getFaucetTotalBtc } from "../api.js";
import { formatCoinAmount } from "../consts.js";

function updateTotalBtcText(totalBtc) {
  const nodes = document.querySelectorAll("[data-total-btc]");

  for (const node of nodes) {
    node.textContent = `${formatCoinAmount(totalBtc)} available`;
  }
}

export async function initIndexPage() {
  const totalBtc = await getFaucetTotalBtc();
  updateTotalBtcText(totalBtc);
}
