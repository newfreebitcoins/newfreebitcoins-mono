import { BACKEND_ENDPOINT } from "./consts.js";

async function parseJson(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

export async function getJson(url) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "include"
    });
    const payload = await parseJson(response);

    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error ?? `request_failed_${response.status}`
      };
    }

    return {
      ok: true,
      data: payload
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "network_error"
    };
  }
}

export async function postJson(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const responsePayload = await parseJson(response);

    if (!response.ok) {
      return {
        ok: false,
        error: responsePayload?.error ?? `request_failed_${response.status}`
      };
    }

    return {
      ok: true,
      data: responsePayload
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "network_error"
    };
  }
}

export async function getFaucetTotalBtc() {
  const result = await getJson(`${BACKEND_ENDPOINT}/api/faucet/total-btc`);

  if (!result.ok) {
    return "0";
  }

  return result.data?.totalBtc ?? "0";
}

export async function getFaucetInfo() {
  const result = await getJson(`${BACKEND_ENDPOINT}/api/faucet/info`);

  if (!result.ok) {
    return {
      ok: false,
      error: result.error
    };
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function getAppConfig() {
  const result = await getJson(`${BACKEND_ENDPOINT}/api/app-config`);

  if (!result.ok) {
    return {
      ok: false,
      error: result.error
    };
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function getRuntimeConfig() {
  const result = await getJson(`${BACKEND_ENDPOINT}/api/config`);

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function startFaucetRequest(bitcoinAddress) {
  const result = await postJson(`${BACKEND_ENDPOINT}/api/faucet/request/start`, {
    bitcoinAddress
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    authorizationUrl: result.data?.authorizationUrl ?? ""
  };
}

export async function getFaucetRequestById(requestId) {
  const result = await getJson(
    `${BACKEND_ENDPOINT}/api/faucet/request/${encodeURIComponent(requestId)}`
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function refreshFaucetRequest(requestId, refreshToken) {
  const result = await postJson(
    `${BACKEND_ENDPOINT}/api/faucet/request/${encodeURIComponent(requestId)}/refresh`,
    {
      refreshToken
    }
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data?.request ?? null
  };
}

export async function getWalletBalance(address) {
  const url = new URL(`${BACKEND_ENDPOINT}/api/wallet/balance`);
  url.searchParams.set("address", address);

  const result = await getJson(url.toString());

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function getWalletUtxos(address) {
  const url = new URL(`${BACKEND_ENDPOINT}/api/donations/wallet-utxos`);
  url.searchParams.set("address", address);

  return getJson(url.toString());
}

export async function getWalletActivity(address, limit = 15) {
  const url = new URL(`${BACKEND_ENDPOINT}/api/donations/activity`);
  url.searchParams.set("address", address);
  url.searchParams.set("limit", String(limit));

  return getJson(url.toString());
}

export async function reserveDonationRequests(donorAddress, maxRequests) {
  return postJson(`${BACKEND_ENDPOINT}/api/donations/reserve-requests`, {
    donorAddress,
    maxRequests
  });
}

export async function submitDonationFulfillment(
  donorAddress,
  requestIds,
  rawTransactionHex
) {
  return postJson(`${BACKEND_ENDPOINT}/api/donations/submit-fulfillment`, {
    donorAddress,
    requestIds,
    rawTransactionHex
  });
}

export async function sendDonationTransaction(donorAddress, rawTransactionHex) {
  return postJson(`${BACKEND_ENDPOINT}/api/donations/send-transaction`, {
    donorAddress,
    rawTransactionHex
  });
}

export async function getTransactionStatus(txid) {
  const url = new URL(`${BACKEND_ENDPOINT}/api/donations/tx-status`);
  url.searchParams.set("txid", txid);

  return getJson(url.toString());
}

export async function getPendingRequests(page = 1, pageSize = 10) {
  const url = new URL(`${BACKEND_ENDPOINT}/api/faucet/pending-requests`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));

  const result = await getJson(url.toString());

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function getRecentSends(page = 1, pageSize = 10) {
  const url = new URL(`${BACKEND_ENDPOINT}/api/faucet/recent-sends`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));

  const result = await getJson(url.toString());

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function getActiveWallets(page = 1, pageSize = 10) {
  const url = new URL(`${BACKEND_ENDPOINT}/api/donations/active-wallets`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));

  const result = await getJson(url.toString());

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function getStatsSummary() {
  const result = await getJson(`${BACKEND_ENDPOINT}/api/stats`);

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function getDonationChallenge() {
  const result = await getJson(`${BACKEND_ENDPOINT}/api/donations/challenge`);

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data
  };
}

export async function sendDonationHeartbeat(payload) {
  const result = await postJson(`${BACKEND_ENDPOINT}/api/donations/heartbeat`, payload);

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    data: result.data
  };
}
