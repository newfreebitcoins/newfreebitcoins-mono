import { getRecentSends } from "../api.js";

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

function renderRows(sends) {
  const body = document.querySelector("[data-recent-sends-body]");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (!sends.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="4">No fulfilled faucet sends yet.</td>';
    body.appendChild(row);
    return;
  }

  for (const send of sends) {
    const row = document.createElement("tr");
    const xAccountCell = document.createElement("td");
    const addressCell = document.createElement("td");
    const sentAtCell = document.createElement("td");
    const txCell = document.createElement("td");
    const txLink = document.createElement("a");

    xAccountCell.textContent = `@${send.xUsername}`;
    addressCell.textContent = send.bitcoinAddress;
    sentAtCell.textContent = send.paidAt
      ? new Date(send.paidAt).toLocaleString()
      : "Pending confirmation";

    if (send.explorerUrl && send.fulfillmentTxId) {
      txLink.href = send.explorerUrl;
      txLink.target = "_blank";
      txLink.rel = "noreferrer";
      txLink.textContent = send.fulfillmentTxId;
      txCell.appendChild(txLink);
    } else {
      txCell.textContent = "Unavailable";
    }

    row.append(xAccountCell, addressCell, sentAtCell, txCell);
    body.appendChild(row);
  }
}

async function loadPage(page) {
  const result = await getRecentSends(page, 10);

  if (!result.ok) {
    renderRows([]);
    setPaginationButtons(1, 1);
    return 1;
  }

  renderRows(result.data?.sends ?? []);
  setPaginationButtons(result.data?.page ?? 1, result.data?.totalPages ?? 1);
  return result.data?.totalPages ?? 1;
}

export async function initRecentSendsPage() {
  let page = Math.max(
    Number(new URLSearchParams(window.location.search).get("page") ?? 1) || 1,
    1
  );
  let totalPages = 1;

  const prev = document.querySelector("[data-prev-page]");
  const next = document.querySelector("[data-next-page]");

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
