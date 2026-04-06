import { getPendingRequests } from "../api.js";

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

function renderRows(requests) {
  const body = document.querySelector("[data-pending-requests-body]");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (!requests.length) {
    const row = document.createElement("tr");
    row.innerHTML =
      '<td colspan="3">No pending faucet requests yet.</td>';
    body.appendChild(row);
    return;
  }

  for (const request of requests) {
    const row = document.createElement("tr");
    const xAccountCell = document.createElement("td");
    const addressCell = document.createElement("td");
    const requestedAtCell = document.createElement("td");
    const requestedAt = new Date(request.createdAt).toLocaleString();

    xAccountCell.textContent = `@${request.xUsername}`;
    addressCell.textContent = request.bitcoinAddress;
    requestedAtCell.textContent = requestedAt;

    row.append(xAccountCell, addressCell, requestedAtCell);
    body.appendChild(row);
  }
}

async function loadPage(page) {
  const result = await getPendingRequests(page, 10);

  if (!result.ok) {
    renderRows([]);
    setPaginationButtons(1, 1);
    return;
  }

  renderRows(result.data?.requests ?? []);
  setPaginationButtons(result.data?.page ?? 1, result.data?.totalPages ?? 1);
  return result.data?.totalPages ?? 1;
}

export async function initPendingRequestsPage() {
  const params = new URLSearchParams(window.location.search);
  let page = Math.max(Number(params.get("page") ?? 1) || 1, 1);
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
