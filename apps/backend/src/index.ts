import crypto from "node:crypto";
import express from "express";
import { Transaction as BitcoinTransaction, address as bitcoinAddress } from "bitcoinjs-lib";
import { Op } from "sequelize";
import { databaseConnection, models } from "./database/createConnection.js";
import { loadConfig } from "./config.js";
import {
  getBitcoinNetwork,
  getCurrencyCode,
  isValidBitcoinAddress
} from "./lib/bitcoin.js";
import {
  getActiveDonationWalletsPage,
  getDonationBalanceCache,
  getDonationChallenge,
  isDonationWalletActive,
  startDonationRuntime,
  verifyDonationHeartbeat
} from "./lib/donations.js";
import {
  broadcastTransaction,
  getAddressBalance,
  getAddressHistory,
  getAddressUtxos,
  getPreviousOutput,
  getTransactionHex,
  getTransactionStatus
} from "./lib/esplora.js";
import {
  buildXAuthorizationUrl,
  createOAuthState,
  createPkcePair,
  exchangeCodeForToken,
  getXUserProfile,
  isVerifiedXUser
} from "./lib/xOAuth.js";
import {
  type CachedFaucetRequest,
  getAllCachedFaucetRequests,
  getCachedFaucetRequest,
  getCachedFaucetRequestsByFilter,
  hydrateFaucetRequestCache,
  upsertCachedFaucetRequest
} from "./lib/faucetRequestCache.js";

const config = loadConfig();
const app = express();
const activeNetwork = config.network;
const OAUTH_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

function getActiveElectrsConfig() {
  return config.electrs[config.network];
}

function getActiveElectrsPublicBaseUrl() {
  const activeElectrsConfig = getActiveElectrsConfig();
  return activeElectrsConfig.publicBaseUrl ?? activeElectrsConfig.baseUrl;
}

function getActiveExplorerConfig() {
  return config.explorer[config.network];
}

function getUnitLabel() {
  return getCurrencyCode();
}

function formatSatsAsBtc(sats: number) {
  return (Number(sats) / 100_000_000).toFixed(8);
}

function getFaucetRequestExpiresAt() {
  return new Date(Date.now() + config.faucet.requestRefreshTimeoutMs);
}

function getExplorerTxUrl(txid: string) {
  const baseUrl = getActiveExplorerConfig().txBaseUrl;
  return `${baseUrl}${encodeURIComponent(txid)}`;
}

function createRefreshSecret() {
  return crypto.randomBytes(32).toString("hex");
}

function hashRefreshSecret(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

function getSuccessRedirect(requestId: number, refreshToken: string): string {
  const searchParams = new URLSearchParams({
    status: "success",
    requestId: String(requestId),
    refreshToken
  });
  return getRequestPageUrl(searchParams);
}

function getFaucetRequestLockKey(network: string, xUserId: string) {
  return `faucet-request:${network}:${xUserId}`;
}

function getOAuthStateCookieName(state: string) {
  return `nfb_oauth_${hashRefreshSecret(state).slice(0, 16)}`;
}

function getCookieValue(request: express.Request, cookieName: string) {
  const rawCookieHeader = request.headers.cookie;

  if (!rawCookieHeader) {
    return "";
  }

  const cookieParts = rawCookieHeader.split(";");

  for (const cookiePart of cookieParts) {
    const [name, ...valueParts] = cookiePart.trim().split("=");

    if (name === cookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return "";
}

function setOAuthStateCookie(response: express.Response, state: string, sessionSecret: string) {
  response.cookie(getOAuthStateCookieName(state), sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: OAUTH_COOKIE_MAX_AGE_MS,
    path: "/api/x_oauth2_callback"
  });
}

function clearOAuthStateCookie(response: express.Response, state: string) {
  response.clearCookie(getOAuthStateCookieName(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/api/x_oauth2_callback"
  });
}

function isRefreshSecretValid(
  faucetRequest: InstanceType<typeof models.FaucetRequest> | CachedFaucetRequest,
  refreshToken: string
) {
  if (!refreshToken || !faucetRequest.refreshSecretHash) {
    return false;
  }

  return hashRefreshSecret(refreshToken) === faucetRequest.refreshSecretHash;
}

function serializeFaucetRequest(
  row: InstanceType<typeof models.FaucetRequest> | CachedFaucetRequest
) {
  const txid = row.fulfillmentTxId;

  return {
    id: row.id,
    network: row.network,
    xUsername: row.xUsername,
    xName: row.xName,
    bitcoinAddress: row.bitcoinAddress,
    amountSats: row.amountSats,
    amountBtc: formatSatsAsBtc(Number(row.amountSats ?? 0)),
    status: row.status,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    fulfillmentTxId: txid,
    paidAt: row.paidAt,
    explorerUrl: txid ? getExplorerTxUrl(txid) : null
  };
}

async function validateTransactionInputsOwnedByAddress(
  transaction: BitcoinTransaction,
  donorAddress: string
) {
  for (const input of transaction.ins) {
    const previousTxId = Buffer.from(input.hash).reverse().toString("hex");
    const previousOutput = await getPreviousOutput(previousTxId, input.index);

    if (previousOutput.address !== donorAddress) {
      throw new Error("transaction_input_not_owned_by_donor");
    }
  }
}

function getConfigPayload() {
  const donationBalance = getDonationBalanceCache();

  return {
    network: config.network,
    unitLabel: getUnitLabel(),
    electrs: {
      apiBaseUrl: getActiveElectrsPublicBaseUrl()
    },
    explorer: getActiveExplorerConfig(),
    faucet: {
      totalBtc: donationBalance.totalBtc,
      totalActiveBalanceSats: donationBalance.totalActiveBalanceSats,
      activeWalletCount: donationBalance.activeWalletCount,
      requestAmountSats: config.faucet.requestAmountSats,
      requestAmountBtc: formatSatsAsBtc(config.faucet.requestAmountSats),
      minimumAccountAgeYears: config.faucet.minimumAccountAgeYears,
      requireVerified: config.faucet.requireVerified,
      requestRefreshTimeoutMs: config.faucet.requestRefreshTimeoutMs,
      multiplePerAccount: config.faucet.multiplePerAccount
    },
    donations: {
      challengeRotationMs: config.donations.challengeRotationMs,
      heartbeatPollMs: config.donations.heartbeatPollMs,
      activeWindowMs: config.donations.activeWindowMs,
      balanceRefreshMs: config.donations.balanceRefreshMs,
      executionPollMs: config.donations.executionPollMs,
      reservationWindowMs: config.donations.reservationWindowMs,
      feeRateSatPerVbyte: config.donations.feeRateSatPerVbyte,
      broadcastRecoveryMs: config.donations.broadcastRecoveryMs,
      minimumGraffitiBtc: config.donations.minimumGraffitiBtc
    }
  };
}

function syncCachedFaucetRequest(row: InstanceType<typeof models.FaucetRequest>) {
  upsertCachedFaucetRequest({
    id: row.id,
    network: row.network,
    xUserId: row.xUserId,
    xUsername: row.xUsername,
    xName: row.xName,
    xCreatedAt: row.xCreatedAt,
    xVerified: row.xVerified,
    bitcoinAddress: row.bitcoinAddress,
    amountSats: Number(row.amountSats ?? 0),
    status: row.status,
    expiresAt: row.expiresAt,
    refreshSecretHash: row.refreshSecretHash,
    reservedByAddress: row.reservedByAddress,
    reservationExpiresAt: row.reservationExpiresAt,
    fulfillmentTxId: row.fulfillmentTxId,
    paidByAddress: row.paidByAddress,
    paidAt: row.paidAt,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  });
}

async function clearExpiredReservations() {
  const now = new Date();
  const expiredIds = getCachedFaucetRequestsByFilter(
    activeNetwork,
    (row) =>
      row.status === "pending" &&
      row.reservationExpiresAt != null &&
      row.reservationExpiresAt < now
  ).map((row) => row.id);

  if (!expiredIds.length) {
    return;
  }

  await models.FaucetRequest.update(
    {
      reservedByAddress: null,
      reservationExpiresAt: null
    },
    {
      where: {
        id: {
          [Op.in]: expiredIds
        },
        network: activeNetwork
      }
    }
  );

  for (const id of expiredIds) {
    const row = getCachedFaucetRequest(id);
    if (row) {
      upsertCachedFaucetRequest({
        ...row,
        reservedByAddress: null,
        reservationExpiresAt: null,
        updatedAt: now
      });
    }
  }
}

async function clearExpiredFaucetRequests() {
  const now = new Date();
  const expiredIds = getCachedFaucetRequestsByFilter(
    activeNetwork,
    (row) => row.status === "pending" && row.expiresAt != null && row.expiresAt < now
  ).map((row) => row.id);

  if (!expiredIds.length) {
    return;
  }

  await models.FaucetRequest.update(
    {
      status: "expired",
      reservedByAddress: null,
      reservationExpiresAt: null
    },
    {
      where: {
        id: {
          [Op.in]: expiredIds
        },
        network: activeNetwork
      }
    }
  );

  for (const id of expiredIds) {
    const row = getCachedFaucetRequest(id);
    if (!row) {
      continue;
    }
    upsertCachedFaucetRequest({
      ...row,
      status: "expired",
      reservedByAddress: null,
      reservationExpiresAt: null,
      updatedAt: now
    });
  }
}

async function backfillFaucetRequestExpiry() {
  const requestsWithoutExpiry = getAllCachedFaucetRequests().filter(
    (row) => row.expiresAt == null
  );

  for (const faucetRequest of requestsWithoutExpiry) {
    const baseTime = faucetRequest.createdAt ?? faucetRequest.updatedAt ?? new Date();
    const computedExpiry = new Date(
      new Date(baseTime).valueOf() + config.faucet.requestRefreshTimeoutMs
    );

    const nextStatus =
      faucetRequest.status === "pending" && computedExpiry <= new Date()
        ? "expired"
        : faucetRequest.status;
    const nextExpiry =
      nextStatus === "pending" ? computedExpiry : new Date(baseTime);

    await models.FaucetRequest.update(
      {
        status: nextStatus,
        expiresAt: nextExpiry
      },
      {
        where: {
          id: faucetRequest.id
        }
      }
    );

    upsertCachedFaucetRequest({
      ...faucetRequest,
      status: nextStatus,
      expiresAt: nextExpiry
    });
  }
}

async function reconcileBroadcastRequests() {
  const broadcastRequests = getCachedFaucetRequestsByFilter(
    activeNetwork,
    (row) => row.status === "broadcast" && row.fulfillmentTxId != null
  ).sort((left, right) => left.updatedAt.valueOf() - right.updatedAt.valueOf());

  const byTxId = new Map<string, number[]>();

  for (const request of broadcastRequests) {
    if (!request.fulfillmentTxId) {
      continue;
    }

    const existing = byTxId.get(request.fulfillmentTxId) ?? [];
    existing.push(request.id);
    byTxId.set(request.fulfillmentTxId, existing);
  }

  for (const [txid, requestIds] of byTxId.entries()) {
    try {
      const txStatus = await getTransactionStatus(txid);

      if (!txStatus.confirmed) {
        const staleCutoff = new Date(
          Date.now() - config.donations.broadcastRecoveryMs
        );

        await models.FaucetRequest.update(
          {
            status: "pending",
            fulfillmentTxId: null,
            paidByAddress: null,
            paidAt: null,
            reservedByAddress: null,
            reservationExpiresAt: null
          },
          {
            where: {
              id: {
                [Op.in]: requestIds
              },
              network: activeNetwork,
              status: "broadcast",
              updatedAt: {
                [Op.lt]: staleCutoff
              }
            }
          }
        );
        for (const requestId of requestIds) {
          const cached = getCachedFaucetRequest(requestId);
          if (!cached) {
            continue;
          }
          upsertCachedFaucetRequest({
            ...cached,
            status: "pending",
            fulfillmentTxId: null,
            paidByAddress: null,
            paidAt: null,
            reservedByAddress: null,
            reservationExpiresAt: null,
            updatedAt: new Date()
          });
        }
        continue;
      }

      await models.FaucetRequest.update(
        {
          status: "paid",
          paidAt:
            txStatus.blocktime != null
              ? new Date(txStatus.blocktime * 1000)
              : new Date()
        },
        {
          where: {
            id: {
              [Op.in]: requestIds
            },
            network: activeNetwork,
            status: "broadcast"
          }
        }
      );
      for (const requestId of requestIds) {
        const cached = getCachedFaucetRequest(requestId);
        if (!cached) {
          continue;
        }
        upsertCachedFaucetRequest({
          ...cached,
          status: "paid",
          paidAt:
            txStatus.blocktime != null
              ? new Date(txStatus.blocktime * 1000)
              : new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error("Unable to reconcile broadcast request", txid, error);
    }
  }
}

async function reserveNextFaucetRequests(
  donorAddress: string,
  maxRequests: number
) {
  const reservationExpiresAt = new Date(
    Date.now() + config.donations.reservationWindowMs
  );
  const now = new Date();
  const candidates = getCachedFaucetRequestsByFilter(
    activeNetwork,
    (row) =>
      row.status === "pending" &&
      (row.reservedByAddress == null ||
        (row.reservationExpiresAt != null && row.reservationExpiresAt < now))
  )
    .sort((left, right) => left.createdAt.valueOf() - right.createdAt.valueOf())
    .slice(0, Math.max(maxRequests * 5, maxRequests));

  const reservedIds: number[] = [];

  for (const candidate of candidates) {
    if (reservedIds.length >= maxRequests) {
      break;
    }

    const [updatedCount] = await models.FaucetRequest.update(
      {
        reservedByAddress: donorAddress,
        reservationExpiresAt
      },
      {
        where: {
          id: candidate.id,
          network: activeNetwork,
          status: "pending",
          [Op.or]: [
            {
              reservedByAddress: null
            },
            {
              reservationExpiresAt: {
                [Op.lt]: new Date()
              }
            }
          ]
        }
      }
    );

    if (updatedCount > 0) {
      reservedIds.push(candidate.id);
      upsertCachedFaucetRequest({
        ...candidate,
        reservedByAddress: donorAddress,
        reservationExpiresAt,
        updatedAt: new Date()
      });
    }
  }

  if (!reservedIds.length) {
    return {
      reservationExpiresAt,
      requests: []
    };
  }

  const requests = reservedIds
    .map((id) => getCachedFaucetRequest(id))
    .filter(
      (
        row
      ): row is NonNullable<ReturnType<typeof getCachedFaucetRequest>> =>
        row != null &&
        row.network === activeNetwork &&
        row.reservedByAddress === donorAddress &&
        row.status === "pending"
    )
    .sort(
      (left: CachedFaucetRequest, right: CachedFaucetRequest) =>
        left.createdAt.valueOf() - right.createdAt.valueOf()
    );

  return {
    reservationExpiresAt,
    requests
  };
}

function getFrontendBaseUrl(): string {
  return config.host ?? "https://newfreebitcoins.github.io";
}

function getRequestPageUrl(searchParams?: URLSearchParams): string {
  const url = new URL("/faucet-request/", getFrontendBaseUrl());

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url.toString();
}

function getMinimumAllowedCreatedAt(): Date {
  const minimum = new Date();
  minimum.setFullYear(
    minimum.getFullYear() - config.faucet.minimumAccountAgeYears
  );
  return minimum;
}

function getErrorRedirect(code: string): string {
  const searchParams = new URLSearchParams({ error: code });
  return getRequestPageUrl(searchParams);
}

function getErrorRedirectWithDetail(code: string, detail: string): string {
  const searchParams = new URLSearchParams({
    error: code,
    errorDetail: detail
  });
  return getRequestPageUrl(searchParams);
}

function setCorsHeaders(response: express.Response) {
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Credentials", "true");
}

function sendFrontendRedirect(response: express.Response, targetUrl: string) {
  const escapedUrl = JSON.stringify(targetUrl);
  const htmlUrl = targetUrl.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  response
    .status(200)
    .type("html")
    .send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Completing X Authorization</title>
    <meta http-equiv="refresh" content="0;url=${targetUrl}" />
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 14px;
        color: #575757;
        padding: 24px;
      }
    </style>
  </head>
  <body>
    <p>Completing X authorization...</p>
    <p><a id="continue-link" href="${htmlUrl}">Continue</a></p>
    <script>
      window.location.replace(${escapedUrl});
    </script>
  </body>
</html>`);
}

app.use(express.json());
app.use((request, response, next) => {
  const origin = request.headers.origin;

  setCorsHeaders(response);
  response.setHeader("Access-Control-Allow-Origin", origin || "*");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  next();
});

app.get("/api/faucet/total-btc", (_request, response) => {
  response.json(getDonationBalanceCache());
});

app.get("/api/faucet/info", (_request, response) => {
  const payload = getConfigPayload();
  response.json({
    network: payload.network,
    unitLabel: payload.unitLabel,
    electrs: payload.electrs,
    totalBtc: payload.faucet.totalBtc,
    totalActiveBalanceSats: payload.faucet.totalActiveBalanceSats,
    activeWalletCount: payload.faucet.activeWalletCount,
    requestAmountSats: payload.faucet.requestAmountSats,
    requestAmountBtc: payload.faucet.requestAmountBtc,
    minimumAccountAgeYears: payload.faucet.minimumAccountAgeYears,
    requireVerified: payload.faucet.requireVerified,
    requestRefreshTimeoutMs: payload.faucet.requestRefreshTimeoutMs,
    multiplePerAccount: payload.faucet.multiplePerAccount
  });
});

app.get("/api/app-config", (_request, response) => {
  response.json(getConfigPayload());
});

app.get("/api/config", (_request, response) => {
  response.json(getConfigPayload());
});

app.get("/api/donations/challenge", (_request, response) => {
  response.json(getDonationChallenge());
});

app.post("/api/donations/heartbeat", (request, response) => {
  const address = String(request.body?.address ?? "").trim();
  const publicKeyHex = String(request.body?.publicKeyHex ?? "").trim();
  const challenge = String(request.body?.challenge ?? "").trim();
  const signatureHex = String(request.body?.signatureHex ?? "").trim();
  const graffiti =
    typeof request.body?.graffiti === "string" ? request.body.graffiti : "";

  if (!isValidBitcoinAddress(address)) {
    response.status(400).json({ error: "invalid_bitcoin_address" });
    return;
  }

  if (!/^[0-9a-f]+$/i.test(publicKeyHex) || publicKeyHex.length < 66) {
    response.status(400).json({ error: "invalid_public_key" });
    return;
  }

  if (!/^[0-9a-f]+$/i.test(challenge) || challenge.length !== 64) {
    response.status(400).json({ error: "invalid_donation_challenge" });
    return;
  }

  if (!/^[0-9a-f]+$/i.test(signatureHex) || signatureHex.length !== 128) {
    response.status(400).json({ error: "invalid_donation_signature" });
    return;
  }

  try {
    const donationBalance = verifyDonationHeartbeat({
      address,
      publicKeyHex,
      challenge,
      signatureHex,
      graffiti
    });

    response.json({
      ok: true,
      ...donationBalance
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "invalid_donation_heartbeat";

    response.status(400).json({
      error: detail
    });
  }
});

app.get("/api/donations/active-wallets", (_request, response) => {
  const page = Math.max(Number(_request.query.page ?? 1) || 1, 1);
  const pageSize = Math.min(Math.max(Number(_request.query.pageSize ?? 10) || 10, 1), 50);

  response.json(getActiveDonationWalletsPage(page, pageSize));
});

app.get("/api/donations/wallet-utxos", async (request, response) => {
  const address = String(request.query.address ?? "").trim();

  if (!isValidBitcoinAddress(address)) {
    response.status(400).json({ error: "invalid_bitcoin_address" });
    return;
  }

  try {
    const utxos = await getAddressUtxos(address);
    response.json({
      address,
      scriptHex: Buffer.from(
        bitcoinAddress.toOutputScript(address, getBitcoinNetwork())
      ).toString("hex"),
      utxos
    });
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: "electrs_utxo_lookup_failed" });
  }
});

app.get("/api/donations/tx-status", async (request, response) => {
  const txid = String(request.query.txid ?? "").trim();

  if (!/^[0-9a-f]{64}$/i.test(txid)) {
    response.status(400).json({ error: "invalid_transaction_id" });
    return;
  }

  try {
    const status = await getTransactionStatus(txid);
    response.json({
      ...status,
      explorerUrl: getExplorerTxUrl(txid)
    });
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: "electrs_transaction_lookup_failed" });
  }
});

app.get("/api/donations/activity", async (request, response) => {
  const address = String(request.query.address ?? "").trim();
  const limit = Math.min(Math.max(Number(request.query.limit ?? 15) || 15, 1), 50);

  if (!isValidBitcoinAddress(address)) {
    response.status(400).json({ error: "invalid_bitcoin_address" });
    return;
  }

  try {
    const history = await getAddressHistory(address);
    const paidRequests = getCachedFaucetRequestsByFilter(
      activeNetwork,
      (row) => row.paidByAddress === address && row.fulfillmentTxId != null
    ).sort((left, right) => {
      const leftTime = left.paidAt?.valueOf() ?? 0;
      const rightTime = right.paidAt?.valueOf() ?? 0;
      return rightTime - leftTime;
    });

    const paidByTxId = new Map<
      string,
      {
        txid: string;
        totalSats: number;
        requestCount: number;
        occurredAt: string | null;
      }
    >();

    for (const paidRequest of paidRequests) {
      if (!paidRequest.fulfillmentTxId) {
        continue;
      }

      const existing = paidByTxId.get(paidRequest.fulfillmentTxId) ?? {
        txid: paidRequest.fulfillmentTxId,
        totalSats: 0,
        requestCount: 0,
        occurredAt: paidRequest.paidAt?.toISOString() ?? null
      };

      existing.totalSats += Number(paidRequest.amountSats ?? 0);
      existing.requestCount += 1;
      existing.occurredAt =
        paidRequest.paidAt?.toISOString() ?? existing.occurredAt;
      paidByTxId.set(paidRequest.fulfillmentTxId, existing);
    }

    const historyItems = await Promise.all(
      history.slice(-limit * 2).map(async (item) => {
        if (!item.tx_hash || paidByTxId.has(item.tx_hash)) {
          return null;
        }

        const txStatus = await getTransactionStatus(item.tx_hash).catch(
          () => null
        );

        let amountReceivedSats = 0;
        let amountSpentFromAddressSats = 0;

        try {
          const raw = await getTransactionHex(item.tx_hash);
          const transaction = BitcoinTransaction.fromHex(raw);

          await Promise.all(
            transaction.ins.map(async (input) => {
              const previousTxId = Buffer.from(input.hash).reverse().toString("hex");
              const previousOutput = await getPreviousOutput(
                previousTxId,
                input.index
              ).catch(() => null);

              if (previousOutput?.address === address) {
                amountSpentFromAddressSats += Number(previousOutput.value ?? 0);
              }
            })
          );

          for (const output of transaction.outs) {
            try {
              const outputAddress = bitcoinAddress.fromOutputScript(
                output.script,
                getBitcoinNetwork()
              );

              if (outputAddress === address) {
                amountReceivedSats += Number(output.value);
              }
            } catch {
              continue;
            }
          }
        } catch {
          amountReceivedSats = 0;
          amountSpentFromAddressSats = 0;
        }

        if (amountSpentFromAddressSats > amountReceivedSats) {
          const sentAmountSats = amountSpentFromAddressSats - amountReceivedSats;

          if (sentAmountSats <= 0) {
            return null;
          }

          return {
            type: "send",
            txid: item.tx_hash,
            amountSats: sentAmountSats,
            amountBtc: formatSatsAsBtc(sentAmountSats),
            confirmations: txStatus?.confirmations ?? 0,
            occurredAt:
              txStatus?.blocktime != null
                ? new Date(txStatus.blocktime * 1000).toISOString()
                : null,
            explorerUrl: getExplorerTxUrl(item.tx_hash)
          };
        }

        if (amountReceivedSats <= 0) {
          return null;
        }

        return {
          type: "deposit",
          txid: item.tx_hash,
          amountSats: amountReceivedSats,
          amountBtc: formatSatsAsBtc(amountReceivedSats),
          confirmations: txStatus?.confirmations ?? 0,
          occurredAt:
            txStatus?.blocktime != null
              ? new Date(txStatus.blocktime * 1000).toISOString()
              : null,
          explorerUrl: getExplorerTxUrl(item.tx_hash)
        };
      })
    );

    const fulfillmentItems = await Promise.all(
      [...paidByTxId.values()].map(async (item) => {
        const txStatus = await getTransactionStatus(item.txid).catch(() => null);

        return {
          type: "faucet_fulfillment",
          txid: item.txid,
          amountSats: item.totalSats,
          amountBtc: formatSatsAsBtc(item.totalSats),
          requestCount: item.requestCount,
          confirmations: txStatus?.confirmations ?? 0,
          occurredAt:
            txStatus?.blocktime != null
              ? new Date(txStatus.blocktime * 1000).toISOString()
              : item.occurredAt,
          explorerUrl: getExplorerTxUrl(item.txid)
        };
      })
    );

    const items = [...historyItems.filter(Boolean), ...fulfillmentItems]
      .sort((left, right) => {
        const leftTime = left?.occurredAt ? new Date(left.occurredAt).valueOf() : 0;
        const rightTime = right?.occurredAt ? new Date(right.occurredAt).valueOf() : 0;
        return rightTime - leftTime;
      })
      .slice(0, limit);

    response.json({
      address,
      items
    });
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: "wallet_activity_lookup_failed" });
  }
});

app.post("/api/donations/send-transaction", async (request, response) => {
  const donorAddress = String(request.body?.donorAddress ?? "").trim();
  const rawTransactionHex = String(request.body?.rawTransactionHex ?? "").trim();

  if (!isValidBitcoinAddress(donorAddress)) {
    response.status(400).json({ error: "invalid_bitcoin_address" });
    return;
  }

  if (!/^[0-9a-f]+$/i.test(rawTransactionHex)) {
    response.status(400).json({ error: "invalid_raw_transaction" });
    return;
  }

  try {
    const transaction = BitcoinTransaction.fromHex(rawTransactionHex);
    await validateTransactionInputsOwnedByAddress(transaction, donorAddress);
    const txid = await broadcastTransaction(rawTransactionHex);

    response.json({
      ok: true,
      txid,
      explorerUrl: getExplorerTxUrl(txid)
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "transaction_broadcast_failed";

    if (message === "transaction_input_not_owned_by_donor") {
      response.status(400).json({ error: message });
      return;
    }

    console.error(error);
    response.status(502).json({ error: "transaction_broadcast_failed" });
  }
});

app.post("/api/donations/reserve-requests", async (request, response) => {
  const donorAddress = String(request.body?.donorAddress ?? "").trim();
  const maxRequests = Math.min(
    Math.max(Number(request.body?.maxRequests ?? 1) || 1, 1),
    25
  );

  if (!isValidBitcoinAddress(donorAddress)) {
    response.status(400).json({ error: "invalid_bitcoin_address" });
    return;
  }

  if (!isDonationWalletActive(donorAddress)) {
    response.status(403).json({ error: "donation_wallet_not_active" });
    return;
  }

  await clearExpiredFaucetRequests();
  await clearExpiredReservations();

  const { reservationExpiresAt, requests: reservedRequests } =
    await reserveNextFaucetRequests(donorAddress, maxRequests);

  response.json({
    donorAddress,
    reservationExpiresAt: reservationExpiresAt.toISOString(),
    requests: reservedRequests.map((row) => ({
      id: row.id,
      bitcoinAddress: row.bitcoinAddress,
      amountSats: row.amountSats,
      amountBtc: formatSatsAsBtc(Number(row.amountSats ?? 0)),
      createdAt: row.createdAt,
      xUsername: row.xUsername
    }))
  });
});

app.post("/api/donations/submit-fulfillment", async (request, response) => {
  const donorAddress = String(request.body?.donorAddress ?? "").trim();
  const rawTransactionHex = String(request.body?.rawTransactionHex ?? "").trim();
  const requestIds = Array.isArray(request.body?.requestIds)
    ? request.body.requestIds
        .map((value: unknown) => Number(value))
        .filter((value: number) => Number.isInteger(value) && value > 0)
    : [];

  if (!isValidBitcoinAddress(donorAddress)) {
    response.status(400).json({ error: "invalid_bitcoin_address" });
    return;
  }

  if (!/^[0-9a-f]+$/i.test(rawTransactionHex)) {
    response.status(400).json({ error: "invalid_raw_transaction" });
    return;
  }

  if (!requestIds.length) {
    response.status(400).json({ error: "missing_reserved_requests" });
    return;
  }

  await clearExpiredReservations();

  const reservedRequests = requestIds
    .map((id: number) => getCachedFaucetRequest(id))
    .filter(
      (row: CachedFaucetRequest | null): row is CachedFaucetRequest =>
        row != null &&
        row.network === activeNetwork &&
        row.status === "pending" &&
        row.reservedByAddress === donorAddress &&
        row.reservationExpiresAt != null &&
        row.reservationExpiresAt > new Date()
    )
    .sort(
      (left: CachedFaucetRequest, right: CachedFaucetRequest) =>
        left.createdAt.valueOf() - right.createdAt.valueOf()
    );

  if (reservedRequests.length !== requestIds.length) {
    response.status(409).json({ error: "reserved_requests_missing_or_expired" });
    return;
  }

  const transaction = BitcoinTransaction.fromHex(rawTransactionHex);
  const outputsByAddress = new Map<string, number>();

  for (const output of transaction.outs) {
    try {
      const address = bitcoinAddress.fromOutputScript(
        output.script,
        getBitcoinNetwork()
      );
      outputsByAddress.set(
        address,
        (outputsByAddress.get(address) ?? 0) + Number(output.value)
      );
    } catch {
      continue;
    }
  }

  const requiredOutputs = new Map<string, number>();
  for (const faucetRequest of reservedRequests) {
    requiredOutputs.set(
      faucetRequest.bitcoinAddress,
      (requiredOutputs.get(faucetRequest.bitcoinAddress) ?? 0) +
        Number(faucetRequest.amountSats ?? 0)
    );
  }

  for (const [address, amountSats] of requiredOutputs.entries()) {
    if ((outputsByAddress.get(address) ?? 0) < amountSats) {
      response.status(400).json({ error: "transaction_does_not_fulfill_requests" });
      return;
    }
  }

  try {
    await validateTransactionInputsOwnedByAddress(transaction, donorAddress);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "transaction_input_not_owned_by_donor";
    response.status(400).json({ error: message });
    return;
  }

  try {
    const txid = await broadcastTransaction(rawTransactionHex);

    await models.FaucetRequest.update(
      {
        status: "broadcast",
        reservedByAddress: null,
        reservationExpiresAt: null,
        fulfillmentTxId: txid,
        paidByAddress: donorAddress,
        paidAt: null
      },
      {
        where: {
          id: {
            [Op.in]: requestIds
          },
          network: activeNetwork
        }
      }
    );
    for (const requestId of requestIds) {
      const cached = getCachedFaucetRequest(requestId);
      if (!cached) {
        continue;
      }
      upsertCachedFaucetRequest({
        ...cached,
        status: "broadcast",
        reservedByAddress: null,
        reservationExpiresAt: null,
        fulfillmentTxId: txid,
        paidByAddress: donorAddress,
        paidAt: null,
        updatedAt: new Date()
      });
    }

    response.json({
      ok: true,
      txid,
      explorerUrl: getExplorerTxUrl(txid)
    });
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: "transaction_broadcast_failed" });
  }
});

app.get("/api/stats", async (_request, response) => {
  await clearExpiredFaucetRequests();
  await clearExpiredReservations();
  const donationBalance = getDonationBalanceCache();
  const pendingRequests = getCachedFaucetRequestsByFilter(
    activeNetwork,
    (row) => row.status === "pending" || row.status === "broadcast"
  );

  const totalPendingSats = pendingRequests.reduce(
    (sum, request) => sum + Number(request.amountSats ?? 0),
    0
  );

  response.json({
    donationWallets: {
      totalActiveBalanceSats: donationBalance.totalActiveBalanceSats,
      totalBtc: donationBalance.totalBtc,
      activeWalletCount: donationBalance.activeWalletCount,
      unitLabel: getUnitLabel()
    },
    queue: {
      requestCount: pendingRequests.length,
      totalPendingSats,
      totalPendingBtc: formatSatsAsBtc(totalPendingSats),
      unitLabel: getUnitLabel()
    }
  });
});

app.get("/api/debug/x-oauth", (_request, response) => {
  const { codeChallenge } = createPkcePair();
  const state = createOAuthState();

  response.json({
    host: config.host ?? null,
    callbackUrl: config.xOAuth.callbackUrl,
    clientType: config.xOAuth.clientType,
    clientId: config.xOAuth.clientId,
    hasClientSecret: Boolean(config.xOAuth.clientSecret),
    scopes: config.xOAuth.scopes,
    authorizationUrl: buildXAuthorizationUrl(state, codeChallenge)
  });
});

app.get("/api/faucet/request/:requestId", async (request, response) => {
  const requestId = Number(request.params.requestId);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    response.status(400).json({ error: "invalid_request_id" });
    return;
  }

  await clearExpiredFaucetRequests();

  const faucetRequest = getCachedFaucetRequest(requestId);

  if (!faucetRequest || faucetRequest.network !== activeNetwork) {
    response.status(404).json({ error: "request_not_found" });
    return;
  }

  response.json({
    ...serializeFaucetRequest(faucetRequest),
    requestRefreshTimeoutMs: config.faucet.requestRefreshTimeoutMs
  });
});

app.post("/api/faucet/request/:requestId/refresh", async (request, response) => {
  const requestId = Number(request.params.requestId);
  const refreshToken = String(request.body?.refreshToken ?? "").trim();

  if (!Number.isInteger(requestId) || requestId <= 0) {
    response.status(400).json({ error: "invalid_request_id" });
    return;
  }

  await clearExpiredFaucetRequests();

  const faucetRequest = await models.FaucetRequest.findOne({
    where: {
      id: requestId,
      network: activeNetwork
    }
  });

  if (!faucetRequest) {
    response.status(404).json({ error: "request_not_found" });
    return;
  }

  if (!isRefreshSecretValid(faucetRequest, refreshToken)) {
    response.status(403).json({ error: "invalid_request_refresh_token" });
    return;
  }

  if (faucetRequest.status !== "pending" && faucetRequest.status !== "expired") {
    response.status(409).json({ error: "request_not_refreshable" });
    return;
  }

  faucetRequest.status = "pending";
  faucetRequest.expiresAt = getFaucetRequestExpiresAt();
  faucetRequest.reservedByAddress = null;
  faucetRequest.reservationExpiresAt = null;
  await faucetRequest.save();
  syncCachedFaucetRequest(faucetRequest);

  response.json({
    ok: true,
    request: {
      ...serializeFaucetRequest(faucetRequest),
      requestRefreshTimeoutMs: config.faucet.requestRefreshTimeoutMs
    }
  });
});

app.get("/api/wallet/balance", async (request, response) => {
  const address = String(request.query.address ?? "").trim();

  if (!isValidBitcoinAddress(address)) {
    response.status(400).json({ error: "invalid_bitcoin_address" });
    return;
  }

  try {
    const balance = await getAddressBalance(address);
    response.json(balance);
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: "electrs_balance_lookup_failed" });
  }
});

app.post("/api/faucet/request/start", async (request, response) => {
  const bitcoinAddress = String(request.body?.bitcoinAddress ?? "").trim();

  if (!isValidBitcoinAddress(bitcoinAddress)) {
    response.status(400).json({ error: "invalid_bitcoin_address" });
    return;
  }

  const { codeVerifier, codeChallenge } = createPkcePair();
  const state = createOAuthState();
  const sessionSecret = createRefreshSecret();

  await models.OAuthRequestState.destroy({
    where: {
      [Op.or]: [
        { expiresAt: { [Op.lt]: new Date() } },
        { bitcoinAddress }
      ]
    }
  });

  await models.OAuthRequestState.create({
    state,
    codeVerifier,
    bitcoinAddress,
    sessionSecretHash: hashRefreshSecret(sessionSecret),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  setOAuthStateCookie(response, state, sessionSecret);

  response.json({
    authorizationUrl: buildXAuthorizationUrl(state, codeChallenge)
  });
});

app.get("/api/x_oauth2_callback", async (request, response) => {
  const code = String(request.query.code ?? "");
  const state = String(request.query.state ?? "");
  const oauthError = String(request.query.error ?? "");

  if (oauthError) {
    console.error("X OAuth denied:", oauthError);
    sendFrontendRedirect(response, getErrorRedirect("x_oauth_denied"));
    return;
  }

  if (!code || !state) {
    console.error("X OAuth callback missing code or state");
    sendFrontendRedirect(response, getErrorRedirect("x_oauth_invalid_callback"));
    return;
  }

  const oauthState = await models.OAuthRequestState.findOne({
    where: {
      state,
      expiresAt: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!oauthState) {
    console.error("X OAuth state missing or expired:", state);
    clearOAuthStateCookie(response, state);
    sendFrontendRedirect(response, getErrorRedirect("x_oauth_state_missing"));
    return;
  }

  const sessionSecret = getCookieValue(request, getOAuthStateCookieName(state));

  if (
    oauthState.sessionSecretHash &&
    (!sessionSecret ||
      hashRefreshSecret(sessionSecret) !== oauthState.sessionSecretHash)
  ) {
    console.warn(
      "X OAuth browser/session cookie missing or mismatched; continuing with state validation only:",
      state
    );
  }

  try {
    const accessToken = await exchangeCodeForToken(code, oauthState.codeVerifier);
    const xUser = await getXUserProfile(accessToken);
    const createdAt = new Date(xUser.created_at);

    if (Number.isNaN(createdAt.valueOf())) {
      throw new Error("X account created_at was invalid");
    }

    if (createdAt > getMinimumAllowedCreatedAt()) {
      console.error("X account too new:", xUser.username, xUser.created_at);
      await oauthState.destroy();
      clearOAuthStateCookie(response, state);
      sendFrontendRedirect(response, getErrorRedirect("x_account_too_new"));
      return;
    }

    const xUserIsVerified = isVerifiedXUser(xUser);

    await clearExpiredFaucetRequests();

    if (config.faucet.requireVerified && !xUserIsVerified) {
      console.error("X account not verified:", xUser.username, xUser);
      await oauthState.destroy();
      clearOAuthStateCookie(response, state);
      sendFrontendRedirect(response, getErrorRedirect("x_account_not_verified"));
      return;
    }
    const refreshToken = createRefreshSecret();
    const refreshSecretHash = hashRefreshSecret(refreshToken);
    const createdRequest = await models.sequelize.transaction(async (transaction) => {
      await models.sequelize.query(
        "SELECT pg_advisory_xact_lock(hashtext(:lockKey))",
        {
          replacements: {
            lockKey: getFaucetRequestLockKey(activeNetwork, xUser.id)
          },
          transaction
        }
      );

      const existingRequest = await models.FaucetRequest.findOne({
        where: config.faucet.multiplePerAccount
          ? {
              network: activeNetwork,
              xUserId: xUser.id,
              status: {
                [Op.in]: ["pending", "broadcast", "expired"]
              }
            }
          : {
              network: activeNetwork,
              xUserId: xUser.id
            },
        order: [["createdAt", "DESC"]],
        transaction
      });

      if (existingRequest) {
        throw new Error("request_already_pending");
      }

      return models.FaucetRequest.create(
        {
          network: activeNetwork,
          xUserId: xUser.id,
          xUsername: xUser.username,
          xName: xUser.name ?? null,
          xCreatedAt: createdAt,
          xVerified: xUserIsVerified,
          bitcoinAddress: oauthState.bitcoinAddress,
          amountSats: config.faucet.requestAmountSats,
          status: "pending",
          expiresAt: getFaucetRequestExpiresAt(),
          refreshSecretHash,
          rejectionReason: null
        },
        {
          transaction
        }
      );
    });

    syncCachedFaucetRequest(createdRequest);
    await oauthState.destroy();
    clearOAuthStateCookie(response, state);

    console.error("Created faucet request:", createdRequest.id, xUser.username);
    sendFrontendRedirect(response, getSuccessRedirect(createdRequest.id, refreshToken));
  } catch (error) {
    console.error(error);
    await oauthState.destroy();
    clearOAuthStateCookie(response, state);
    const detail =
      error instanceof Error ? error.message : "Unknown OAuth callback error";

    if (detail === "request_already_pending") {
      sendFrontendRedirect(response, getErrorRedirect("request_already_pending"));
      return;
    }

    sendFrontendRedirect(
      response,
      getErrorRedirectWithDetail("x_oauth_request_failed", detail)
    );
  }
});

app.get("/api/faucet/pending-requests", async (request, response) => {
  await clearExpiredFaucetRequests();
  await clearExpiredReservations();
  const page = Math.max(Number(request.query.page ?? 1) || 1, 1);
  const pageSize = Math.min(Math.max(Number(request.query.pageSize ?? 10) || 10, 1), 50);
  const offset = (page - 1) * pageSize;

  const rows = getCachedFaucetRequestsByFilter(
    activeNetwork,
    (row) => row.status === "pending" && row.reservedByAddress == null
  ).sort((left, right) => left.createdAt.valueOf() - right.createdAt.valueOf());
  const count = rows.length;
  const pagedRows = rows.slice(offset, offset + pageSize);

  response.json({
    page,
    pageSize,
    totalCount: count,
    totalPages: Math.max(Math.ceil(count / pageSize), 1),
    requests: pagedRows.map((row) => ({
      id: row.id,
      xUsername: row.xUsername,
      xName: row.xName,
      bitcoinAddress: row.bitcoinAddress,
      amountSats: row.amountSats,
      createdAt: row.createdAt
    }))
  });
});

app.get("/api/faucet/recent-sends", async (request, response) => {
  const page = Math.max(Number(request.query.page ?? 1) || 1, 1);
  const pageSize = Math.min(Math.max(Number(request.query.pageSize ?? 10) || 10, 1), 50);
  const offset = (page - 1) * pageSize;

  const rows = getCachedFaucetRequestsByFilter(
    activeNetwork,
    (row) => row.status === "paid" && row.fulfillmentTxId != null
  ).sort((left, right) => {
    const leftTime = left.paidAt?.valueOf() ?? left.updatedAt.valueOf();
    const rightTime = right.paidAt?.valueOf() ?? right.updatedAt.valueOf();
    return rightTime - leftTime;
  });
  const count = rows.length;
  const pagedRows = rows.slice(offset, offset + pageSize);

  response.json({
    page,
    pageSize,
    totalCount: count,
    totalPages: Math.max(Math.ceil(count / pageSize), 1),
    sends: pagedRows.map((row) => ({
      id: row.id,
      xUsername: row.xUsername,
      bitcoinAddress: row.bitcoinAddress,
      amountSats: row.amountSats,
      amountBtc: formatSatsAsBtc(Number(row.amountSats ?? 0)),
      paidAt: row.paidAt,
      fulfillmentTxId: row.fulfillmentTxId,
      explorerUrl:
        row.fulfillmentTxId != null ? getExplorerTxUrl(row.fulfillmentTxId) : null
    }))
  });
});

async function start() {
  await databaseConnection();
  await hydrateFaucetRequestCache(models);
  await backfillFaucetRequestExpiry();
  await startDonationRuntime();
  await clearExpiredFaucetRequests();
  await clearExpiredReservations();
  await reconcileBroadcastRequests();

  setInterval(() => {
    void clearExpiredFaucetRequests();
  }, Math.min(config.faucet.requestRefreshTimeoutMs, 60 * 1000)).unref();

  setInterval(() => {
    void clearExpiredReservations();
  }, Math.min(config.donations.reservationWindowMs, 60 * 1000)).unref();

  setInterval(() => {
    void reconcileBroadcastRequests();
  }, config.donations.balanceRefreshMs).unref();

  if (
    config.xOAuth.apiKey &&
    config.xOAuth.apiSecret &&
    config.xOAuth.apiKey !== "replace-me" &&
    config.xOAuth.apiSecret !== "replace-me"
  ) {
    console.warn(
      "X OAuth note: apiKey/apiSecret are not used for OAuth 2.0 PKCE user-context requests. X's official docs require Client ID/Client Secret for this flow."
    );
  }

  app.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
}

void start();
