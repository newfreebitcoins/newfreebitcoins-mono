import { getActiveWallets, getStatsSummary } from "../api.js";
import { formatCoinAmount } from "../consts.js";

function setPaginationButtons(page, totalPages) {
  const prev = document.querySelector("[data-prev-page]");
  const next = document.querySelector("[data-next-page]");
  const label = document.querySelector("[data-page-label]");

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

function renderSummary(summary) {
  const donationHeldNode = document.querySelector("[data-stats-donation-held]");
  const queueBtcNode = document.querySelector("[data-stats-queue-btc]");
  const queueCountNode = document.querySelector("[data-stats-queue-count]");

  if (donationHeldNode) {
    donationHeldNode.textContent = formatCoinAmount(
      summary?.donationWallets?.totalBtc ?? "0"
    );
  }

  if (queueBtcNode) {
    queueBtcNode.textContent = formatCoinAmount(
      summary?.queue?.totalPendingBtc ?? "0"
    );
  }

  if (queueCountNode) {
    queueCountNode.textContent = String(summary?.queue?.requestCount ?? 0);
  }
}

function renderRows(wallets) {
  const body = document.querySelector("[data-active-wallets-body]");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (!wallets.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="3">No active donation wallets right now.</td>';
    body.appendChild(row);
    return;
  }

  for (const wallet of wallets) {
    const row = document.createElement("tr");
    const addressCell = document.createElement("td");
    const balanceCell = document.createElement("td");
    const lastSeenCell = document.createElement("td");
    const addressWrap = document.createElement("div");
    const activeDot = document.createElement("span");
    const addressText = document.createElement("span");

    addressWrap.className = "wallet-address";
    activeDot.className = "active-dot";
    activeDot.setAttribute("aria-hidden", "true");
    addressText.textContent = wallet.address;

    addressWrap.append(activeDot, addressText);
    addressCell.append(addressWrap);
    balanceCell.textContent = formatCoinAmount(wallet.balanceBtc);
    lastSeenCell.textContent = new Date(wallet.lastHeartbeatAt).toLocaleString();

    row.append(addressCell, balanceCell, lastSeenCell);
    body.appendChild(row);
  }
}

async function loadSummary() {
  const result = await getStatsSummary();

  if (!result.ok) {
    renderSummary(null);
    return;
  }

  renderSummary(result.data);
}

async function loadPage(page) {
  const result = await getActiveWallets(page, 10);

  if (!result.ok) {
    renderRows([]);
    setPaginationButtons(1, 1);
    return 1;
  }

  renderRows(result.data?.wallets ?? []);
  setPaginationButtons(result.data?.page ?? 1, result.data?.totalPages ?? 1);
  return result.data?.totalPages ?? 1;
}

export async function initStatsPage() {
  let page = Math.max(Number(new URLSearchParams(window.location.search).get("page") ?? 1) || 1, 1);
  let totalPages = 1;

  const prev = document.querySelector("[data-prev-page]");
  const next = document.querySelector("[data-next-page]");

  await loadSummary();
  totalPages = (await loadPage(page)) ?? 1;

  prev?.addEventListener("click", async () => {
    if (page <= 1) {
      return;
    }

    page -= 1;
    totalPages = (await loadPage(page)) ?? totalPages;
  });

  next?.addEventListener("click", async () => {
    if (page >= totalPages) {
      return;
    }

    page += 1;
    totalPages = (await loadPage(page)) ?? totalPages;
  });
}
