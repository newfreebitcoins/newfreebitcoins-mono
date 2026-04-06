import {
  getFaucetInfo,
  getFaucetRequestById,
  refreshFaucetRequest,
  startFaucetRequest
} from "../api.js";
import {
  formatSatsAsCoins,
  formatCoinAmount,
  getRuntimeAppConfig,
  isLikelyAddressForNetwork
} from "../consts.js";

const STORAGE_KEY = "faucetRequestId";
const REFRESH_TOKEN_STORAGE_KEY = "faucetRequestRefreshToken";
const AUTO_REFRESH_MS = 10000;
let refreshCountdownInterval = null;
let requestAutoRefreshInterval = null;
let allowMultipleRequestsPerAccount = false;

const ERROR_MESSAGES = {
  invalid_bitcoin_address: "Please enter a valid Bitcoin address.",
  invalid_request_id: "That faucet request ID is invalid.",
  request_not_found: "That faucet request could not be found.",
  request_not_refreshable: "That faucet request can no longer be refreshed.",
  invalid_request_refresh_token:
    "This browser is not authorized to refresh that faucet request.",
  x_account_too_new:
    "That X account is not old enough for this faucet. Your account must be at least 1 year old to use it.",
  x_account_not_verified:
    "That X account does not meet the verification requirement for this faucet. You currently need X Premium to use it.",
  request_already_pending:
    "That X account is not allowed to create another faucet request right now.",
  x_oauth_denied: "X authorization was canceled.",
  x_oauth_invalid_callback: "The X callback was incomplete.",
  x_oauth_state_missing: "The X session expired. Please try again.",
  x_oauth_browser_mismatch:
    "The X authorization must be completed in the same browser that started it.",
  x_oauth_request_failed: "The X authorization flow failed. Please try again.",
  network_error: "The request failed. Please try again."
};

function clearRefreshCountdown() {
  if (refreshCountdownInterval) {
    window.clearInterval(refreshCountdownInterval);
    refreshCountdownInterval = null;
  }
}

function clearRequestAutoRefresh() {
  if (requestAutoRefreshInterval) {
    window.clearInterval(requestAutoRefreshInterval);
    requestAutoRefreshInterval = null;
  }
}

function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

function consumeQueryState() {
  const params = getQueryParams();
  const requestId = params.get("requestId");
  const refreshToken = params.get("refreshToken");
  const error = params.get("error");
  const errorDetail = params.get("errorDetail");
  const status = params.get("status");

  if (requestId) {
    window.localStorage.setItem(STORAGE_KEY, requestId);
  }

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  window.history.replaceState({}, document.title, window.location.pathname);

  return {
    requestId,
    error: error
      ? `${ERROR_MESSAGES[error] ?? "The request could not be completed."}${
          errorDetail ? ` (${errorDetail})` : ""
        }`
      : "",
    status:
      status === "success" ? "Your faucet request has been added to the queue." : ""
  };
}

function getSavedRequestId() {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getSavedRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

function clearSavedRequestId() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function clearSavedRefreshToken() {
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

function syncSavedRequestControls() {
  const note = document.querySelector("[data-request-saved-note]");
  const resetButton = document.querySelector("[data-reset-request]");

  if (note) {
    note.hidden = !allowMultipleRequestsPerAccount;
  }

  if (resetButton) {
    resetButton.hidden = !allowMultipleRequestsPerAccount;
  }
}

function showSection(sectionName) {
  const sections = document.querySelectorAll("[data-request-section]");

  for (const section of sections) {
    section.hidden = section.dataset.requestSection !== sectionName;
  }
}

function updateFormMessage(text, type) {
  const node = document.querySelector("[data-request-message]");
  const banner = document.querySelector("[data-request-banner]");

  if (node) {
    node.textContent = text;
    node.dataset.messageType = type;
  }

  if (banner) {
    banner.textContent = type === "error" ? text : "";
    banner.hidden = type !== "error" || !text;
  }
}

function formatStatus(status) {
  switch (status) {
    case "pending":
      return "Pending";
    case "broadcast":
      return "Broadcast";
    case "expired":
      return "Expired";
    case "paid":
      return "Sent";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

function formatCountdown(msRemaining) {
  const totalSeconds = Math.max(Math.floor(msRemaining / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateRefreshUi(expiresAtValue) {
  const refreshButton = document.querySelector("[data-request-refresh]");

  if (!refreshButton || !expiresAtValue) {
    return;
  }

  const expiresAt = new Date(expiresAtValue);
  const msRemaining = expiresAt.valueOf() - Date.now();

  if (msRemaining <= 0) {
    refreshButton.textContent = "Refresh Request";
    refreshButton.disabled = false;
    return;
  }

  refreshButton.textContent = `Refresh Request (${formatCountdown(msRemaining)})`;
  refreshButton.disabled = false;
}

function startRefreshCountdown(expiresAtValue) {
  const refreshWrap = document.querySelector("[data-request-refresh-wrap]");
  const explainer = document.querySelector("[data-request-refresh-explainer]");

  clearRefreshCountdown();

  if (refreshWrap) {
    refreshWrap.hidden = !expiresAtValue;
  }

  if (explainer) {
    explainer.hidden = !expiresAtValue;
  }

  if (!expiresAtValue) {
    return;
  }

  updateRefreshUi(expiresAtValue);
  refreshCountdownInterval = window.setInterval(() => {
    updateRefreshUi(expiresAtValue);
  }, 1000);
}

function renderRequestDetails(request, statusMessage) {
  const idNode = document.querySelector("[data-request-id]");
  const xNode = document.querySelector("[data-request-x-account]");
  const btcNode = document.querySelector("[data-request-btc-address]");
  const amountNode = document.querySelector("[data-request-amount]");
  const statusNode = document.querySelector("[data-request-status]");
  const createdAtNode = document.querySelector("[data-request-created-at]");
  const messageNode = document.querySelector("[data-request-status-message]");
  const txWrap = document.querySelector("[data-request-tx-wrap]");
  const txLink = document.querySelector("[data-request-tx-link]");
  const txMessage = document.querySelector("[data-request-tx-message]");

  if (idNode) {
    idNode.textContent = String(request.id);
  }

  if (xNode) {
    xNode.textContent = `@${request.xUsername}`;
  }

  if (btcNode) {
    btcNode.textContent = request.bitcoinAddress;
  }

  if (amountNode) {
    amountNode.textContent = formatSatsAsCoins(request.amountSats);
  }

  if (statusNode) {
    statusNode.textContent = formatStatus(request.status);
  }

  if (createdAtNode) {
    createdAtNode.textContent = new Date(request.createdAt).toLocaleString();
  }

  if (messageNode) {
    let message = statusMessage ?? "";
    let type = "";

    if (request.status === "paid") {
      message = "Your faucet withdrawal was sent successfully.";
      type = "success";
    } else if (request.status === "broadcast") {
      message =
        "A donation wallet has broadcast your faucet withdrawal. It is waiting for confirmation.";
      type = "";
    } else if (request.status === "pending") {
      message =
        message ||
        "Your faucet request is active. Refresh it before the timer runs out to keep your place in the queue.";
    } else if (request.status === "expired") {
      message =
        "This faucet request expired because it was not refreshed in time. Refresh it again from this browser to reactivate it.";
      type = "error";
    } else if (request.status === "rejected" && request.rejectionReason) {
      message = request.rejectionReason;
      type = "error";
    }

    messageNode.textContent = message;
    messageNode.dataset.messageType = type;
  }

  if (txWrap) {
    txWrap.hidden = !request.fulfillmentTxId;
  }

  if (txLink) {
    if (request.explorerUrl && request.fulfillmentTxId) {
      txLink.href = request.explorerUrl;
      txLink.textContent = request.fulfillmentTxId;
    } else {
      txLink.removeAttribute("href");
      txLink.textContent = "";
    }
  }

  if (txMessage) {
    if (request.status === "paid") {
      txMessage.textContent = "Confirmed transaction:";
      txMessage.dataset.messageType = "success";
    } else if (request.status === "broadcast") {
      txMessage.textContent = "Broadcast transaction:";
      txMessage.dataset.messageType = "";
    } else {
      txMessage.textContent = "";
      txMessage.dataset.messageType = "";
    }
  }

  if (request.status === "pending" || request.status === "expired") {
    startRefreshCountdown(request.expiresAt);
  } else {
    clearRefreshCountdown();
    const refreshWrap = document.querySelector("[data-request-refresh-wrap]");
    const explainer = document.querySelector("[data-request-refresh-explainer]");
    if (refreshWrap) {
      refreshWrap.hidden = true;
    }
    if (explainer) {
      explainer.hidden = true;
    }
  }

  showSection("details");
}

function setClaimButtonText(label) {
  const button = document.querySelector("[data-reveal-finalize]");

  if (button) {
    button.textContent = label;
  }
}

function isLikelyBitcoinAddress(value) {
  return isLikelyAddressForNetwork(
    value,
    getRuntimeAppConfig()?.network ?? "mainnet"
  );
}

function setFinalizeCopy(amountBtc, minimumAccountAgeYears) {
  const block = document.querySelector("[data-finalize-copy]");

  if (!block) {
    return;
  }

  block.innerHTML = `
    <h3>Before You Continue</h3>
    <p><b>Please authenticate your X account to receive ${formatCoinAmount(amountBtc)}.</b></p>
    <ul>
      <li>Only X accounts that are verified can use this faucet.</li>
      <li>Your X account must be more than ${minimumAccountAgeYears} year${minimumAccountAgeYears === 1 ? "" : "s"} old.</li>
      <li>If you qualify, your request will be added to the payout queue.</li>
    </ul>
  `;
}

async function loadSavedRequest(statusMessage = "") {
  const savedRequestId = getSavedRequestId();

  if (!savedRequestId) {
    showSection("form");
    return;
  }

  const result = await getFaucetRequestById(savedRequestId);

  if (!result.ok) {
    clearSavedRequestId();
    clearSavedRefreshToken();
    updateFormMessage(
      ERROR_MESSAGES[result.error] ??
        "The saved faucet request could not be loaded.",
      "error"
    );
    showSection("form");
    return;
  }

  renderRequestDetails(result.data, statusMessage);
}

function startRequestAutoRefresh() {
  clearRequestAutoRefresh();

  requestAutoRefreshInterval = window.setInterval(async () => {
    const savedRequestId = getSavedRequestId();

    if (!savedRequestId) {
      clearRequestAutoRefresh();
      return;
    }

    const result = await getFaucetRequestById(savedRequestId);

    if (!result.ok) {
      if (
        result.error === "request_not_found" ||
        result.error === "invalid_request_id"
      ) {
        clearSavedRequestId();
        clearSavedRefreshToken();
        clearRefreshCountdown();
        clearRequestAutoRefresh();
        updateFormMessage(
          ERROR_MESSAGES[result.error] ??
            "The saved faucet request could not be loaded.",
          "error"
        );
        showSection("form");
      }

      return;
    }

    renderRequestDetails(result.data);
  }, AUTO_REFRESH_MS);
}

export async function initFaucetRequestPage() {
  const form = document.querySelector("[data-faucet-request-form]");
  const bitcoinAddressInput = document.querySelector("[data-bitcoin-address]");
  const submitButton = document.querySelector("[data-submit-request]");
  const revealButton = document.querySelector("[data-reveal-finalize]");
  const refreshButton = document.querySelector("[data-request-refresh]");
  const finalizeBlock = document.querySelector("[data-finalize-block]");
  const resetButton = document.querySelector("[data-reset-request]");
  const { error, status } = consumeQueryState();
  const faucetInfoResult = await getFaucetInfo();

  if (faucetInfoResult.ok) {
    const amountBtc = faucetInfoResult.data?.requestAmountBtc ?? "0.00002500";
    const amountSats = faucetInfoResult.data?.requestAmountSats ?? 2500;
    const minimumAccountAgeYears =
      faucetInfoResult.data?.minimumAccountAgeYears ?? 1;
    allowMultipleRequestsPerAccount =
      faucetInfoResult.data?.multiplePerAccount === true;

    setFinalizeCopy(amountBtc, minimumAccountAgeYears);
    setClaimButtonText(
      `Send ${formatCoinAmount(amountBtc)} (${amountSats.toLocaleString()} satoshi)`
    );
  }

  syncSavedRequestControls();

  showSection("loading");
  clearRequestAutoRefresh();

  if (error) {
    updateFormMessage(error, "error");
    clearSavedRequestId();
    clearSavedRefreshToken();
    showSection("form");
  } else {
    await loadSavedRequest(status);

    if (getSavedRequestId()) {
      startRequestAutoRefresh();
    }

    if (status && !getSavedRequestId()) {
      updateFormMessage(status, "success");
      showSection("form");
    }
  }

  refreshButton?.addEventListener("click", async () => {
    const requestId = getSavedRequestId();
    const refreshToken = getSavedRefreshToken();

    if (!requestId) {
      return;
    }

    refreshButton.disabled = true;
    const result = await refreshFaucetRequest(requestId, refreshToken);

    if (!result.ok || !result.data) {
      if (result.error === "request_not_found") {
        clearSavedRequestId();
        clearSavedRefreshToken();
        clearRefreshCountdown();
        clearRequestAutoRefresh();
        showSection("form");
        return;
      }

      await loadSavedRequest();
      updateFormMessage(
        ERROR_MESSAGES[result.error] ?? "The faucet request could not be refreshed.",
        "error"
      );
      return;
    }

    updateFormMessage("", "");
    renderRequestDetails(
      result.data,
      "Your faucet request timer was refreshed successfully."
    );
  });

  resetButton?.addEventListener("click", () => {
    clearRefreshCountdown();
    clearRequestAutoRefresh();
    clearSavedRequestId();
    clearSavedRefreshToken();
    updateFormMessage("", "");
    if (finalizeBlock) {
      finalizeBlock.hidden = true;
    }
    showSection("form");
  });

  revealButton?.addEventListener("click", () => {
    updateFormMessage("", "");

    if (!isLikelyBitcoinAddress(bitcoinAddressInput?.value ?? "")) {
      updateFormMessage(
        `Please enter a valid ${getRuntimeAppConfig()?.network === "regtest" ? "regtest " : ""}Bitcoin address first.`,
        "error"
      );
      return;
    }

    if (finalizeBlock) {
      finalizeBlock.hidden = false;
    }
  });

  bitcoinAddressInput?.addEventListener("input", () => {
    if (revealButton) {
      revealButton.disabled = !isLikelyBitcoinAddress(bitcoinAddressInput.value);
    }

    if (finalizeBlock && finalizeBlock.hidden === false) {
      finalizeBlock.hidden = !isLikelyBitcoinAddress(bitcoinAddressInput.value);
    }
  });

  if (!form || !bitcoinAddressInput || !submitButton) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    updateFormMessage("", "");

    submitButton.disabled = true;

    const result = await startFaucetRequest(bitcoinAddressInput.value.trim());

    submitButton.disabled = false;

    if (!result.ok) {
      updateFormMessage(
        ERROR_MESSAGES[result.error] ?? "The request could not be completed.",
        "error"
      );
      return;
    }

    if (!result.authorizationUrl) {
      updateFormMessage("The X authorization URL was missing.", "error");
      return;
    }

    window.location.href = result.authorizationUrl;
  });

  window.addEventListener("beforeunload", () => {
    clearRefreshCountdown();
    clearRequestAutoRefresh();
  });
}
