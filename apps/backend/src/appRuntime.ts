import crypto from "node:crypto";
import express from "express";
import { Transaction as BitcoinTransaction } from "bitcoinjs-lib";
import { Op, Transaction as SequelizeTransaction } from "sequelize";
import { models } from "./database/createConnection.js";
import { loadConfig } from "./config.js";
import { getCurrencyCode } from "./lib/bitcoin.js";
import { getDonationBalanceCache } from "./lib/donations.js";
import {
  getAddressBalance,
  getPreviousOutput,
  getTransactionStatus
} from "./lib/esplora.js";

export const config = loadConfig();
export const activeNetwork = config.network;
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

export function getUnitLabel() {
  return getCurrencyCode();
}

export function formatSatsAsBtc(sats: number) {
  return (Number(sats) / 100_000_000).toFixed(8);
}

export function getFaucetRequestExpiresAt() {
  return new Date(Date.now() + config.faucet.requestRefreshTimeoutMs);
}

export function getExplorerTxUrl(txid: string) {
  const baseUrl = getActiveExplorerConfig().txBaseUrl;
  return `${baseUrl}${encodeURIComponent(txid)}`;
}

export function createRefreshSecret() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashRefreshSecret(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function getSuccessRedirect(requestId: number, refreshToken: string): string {
  const searchParams = new URLSearchParams({
    status: "success",
    requestId: String(requestId),
    refreshToken
  });
  return getRequestPageUrl(searchParams);
}

export function getFaucetRequestLockKey(network: string, xUserId: string) {
  return `faucet-request:${network}:${xUserId}`;
}

export function getOAuthStateCookieName(state: string) {
  return `nfb_oauth_${hashRefreshSecret(state).slice(0, 16)}`;
}

export function getCookieValue(request: express.Request, cookieName: string) {
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

export function setOAuthStateCookie(
  response: express.Response,
  state: string,
  sessionSecret: string
) {
  const secure = new URL(config.xOAuth.callbackUrl).protocol === "https:";

  response.cookie(getOAuthStateCookieName(state), sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: OAUTH_COOKIE_MAX_AGE_MS,
    path: "/api/x_oauth2_callback"
  });
}

export function clearOAuthStateCookie(response: express.Response, state: string) {
  const secure = new URL(config.xOAuth.callbackUrl).protocol === "https:";

  response.clearCookie(getOAuthStateCookieName(state), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/api/x_oauth2_callback"
  });
}

export function isRefreshSecretValid(
  faucetRequest: InstanceType<typeof models.FaucetRequest>,
  refreshToken: string
) {
  if (!refreshToken || !faucetRequest.refreshSecretHash) {
    return false;
  }

  return hashRefreshSecret(refreshToken) === faucetRequest.refreshSecretHash;
}

export function serializeFaucetRequest(
  row: InstanceType<typeof models.FaucetRequest>
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

function isDonorBlacklisted(reputation: number) {
  return reputation <= config.donations.minimumReputationNeeded;
}

async function getOrCreateDonor(
  address: string,
  transaction?: SequelizeTransaction
) {
  const existing = await models.Donor.findOne({
    where: {
      network: activeNetwork,
      address
    },
    transaction
  });

  if (existing) {
    return existing;
  }

  return await models.Donor.create(
    {
      network: activeNetwork,
      address,
      reputation: 0
    },
    {
      transaction
    }
  );
}

async function getLockedDonor(
  address: string,
  transaction: SequelizeTransaction
) {
  let donor = await models.Donor.findOne({
    where: {
      network: activeNetwork,
      address
    },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  if (donor) {
    return donor;
  }

  donor = await models.Donor.create(
    {
      network: activeNetwork,
      address,
      reputation: 0
    },
    {
      transaction
    }
  );

  return donor;
}

async function adjustDonorReputation(
  address: string,
  delta: number,
  transaction?: SequelizeTransaction
) {
  const donor = transaction
    ? await getLockedDonor(address, transaction)
    : await getOrCreateDonor(address);
  donor.reputation = Number(donor.reputation ?? 0) + delta;
  await donor.save({ transaction });
  return donor;
}

async function getDonorPromisedAmounts(
  address: string,
  transaction?: SequelizeTransaction
) {
  const now = new Date();
  const [reservedRequests, broadcastRequests] = await Promise.all([
    models.FaucetRequest.findAll({
      attributes: ["amountSats"],
      where: {
        network: activeNetwork,
        status: "pending",
        reservedByAddress: address,
        reservationExpiresAt: {
          [Op.gt]: now
        }
      },
      transaction
    }),
    models.FaucetRequest.findAll({
      attributes: ["amountSats"],
      where: {
        network: activeNetwork,
        status: "broadcast",
        paidByAddress: address
      },
      transaction
    })
  ]);

  const promisedReservationSats = reservedRequests.reduce(
    (sum, request) => sum + Number(request.amountSats ?? 0),
    0
  );
  const promisedBroadcastSats = broadcastRequests.reduce(
    (sum, request) => sum + Number(request.amountSats ?? 0),
    0
  );

  return {
    promisedReservationSats,
    promisedBroadcastSats,
    totalPromisedSats: promisedReservationSats + promisedBroadcastSats
  };
}

export async function getDonorStatus(address: string) {
  const [donor, balance, promised] = await Promise.all([
    getOrCreateDonor(address),
    getAddressBalance(address),
    getDonorPromisedAmounts(address)
  ]);

  const confirmedBalanceSats = Math.max(Number(balance.confirmed ?? 0), 0);
  const unconfirmedBalanceSats = Math.max(Number(balance.unconfirmed ?? 0), 0);
  const availableReserveCapacitySats = Math.max(
    confirmedBalanceSats - promised.totalPromisedSats,
    0
  );
  const reputation = Number(donor.reputation ?? 0);
  const blacklisted = isDonorBlacklisted(reputation);
  const heartbeatRejectedBecauseBalance =
    confirmedBalanceSats < config.donations.minSatsForHeartbeat;
  const heartbeatRejectionReason = blacklisted
    ? "donor_blacklisted"
    : heartbeatRejectedBecauseBalance
      ? "donor_balance_below_heartbeat_minimum"
      : null;
  const reserveRejectionReason = blacklisted
    ? "donor_blacklisted"
    : availableReserveCapacitySats <= 0
      ? "donor_promised_balance_exceeded"
      : null;

  return {
    address,
    reputation,
    minimumReputationNeeded: config.donations.minimumReputationNeeded,
    isBlacklisted: blacklisted,
    minSatsForHeartbeat: config.donations.minSatsForHeartbeat,
    confirmedBalanceSats,
    confirmedBalanceBtc: formatSatsAsBtc(confirmedBalanceSats),
    unconfirmedBalanceSats,
    unconfirmedBalanceBtc: formatSatsAsBtc(unconfirmedBalanceSats),
    promisedReservationSats: promised.promisedReservationSats,
    promisedReservationBtc: formatSatsAsBtc(promised.promisedReservationSats),
    promisedBroadcastSats: promised.promisedBroadcastSats,
    promisedBroadcastBtc: formatSatsAsBtc(promised.promisedBroadcastSats),
    totalPromisedSats: promised.totalPromisedSats,
    totalPromisedBtc: formatSatsAsBtc(promised.totalPromisedSats),
    availableReserveCapacitySats,
    availableReserveCapacityBtc: formatSatsAsBtc(availableReserveCapacitySats),
    canHeartbeat: !heartbeatRejectionReason,
    canReserve: !reserveRejectionReason && !heartbeatRejectedBecauseBalance,
    heartbeatRejectionReason,
    reserveRejectionReason
  };
}

export async function releaseReservationsForDonorRequestIds(
  donorAddress: string,
  requestIds: number[],
  penaltyDelta = 0
) {
  if (!requestIds.length) {
    return;
  }

  await models.sequelize.transaction(async (transaction) => {
    await models.FaucetRequest.update(
      {
        reservedByAddress: null,
        reservationExpiresAt: null
      },
      {
        where: {
          id: {
            [Op.in]: requestIds
          },
          network: activeNetwork,
          status: "pending",
          reservedByAddress: donorAddress
        },
        transaction
      }
    );

    if (penaltyDelta !== 0) {
      await adjustDonorReputation(donorAddress, penaltyDelta, transaction);
    }
  });
}

export async function validateTransactionInputsOwnedByAddress(
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

export async function validateTransactionInputsConfirmed(
  transaction: BitcoinTransaction
) {
  for (const input of transaction.ins) {
    const previousTxId = Buffer.from(input.hash).reverse().toString("hex");
    const previousStatus = await getTransactionStatus(previousTxId);

    if (!previousStatus.confirmed) {
      throw new Error("transaction_uses_unconfirmed_inputs");
    }
  }
}

export async function getTransactionFeeRateSatPerVbyte(
  transaction: BitcoinTransaction
) {
  let totalInputSats = 0;
  let totalOutputSats = 0;

  for (const input of transaction.ins) {
    const previousTxId = Buffer.from(input.hash).reverse().toString("hex");
    const previousOutput = await getPreviousOutput(previousTxId, input.index);
    totalInputSats += Number(previousOutput.value ?? 0);
  }

  for (const output of transaction.outs) {
    totalOutputSats += Number(output.value ?? 0);
  }

  const feeSats = totalInputSats - totalOutputSats;

  if (feeSats < 0) {
    throw new Error("transaction_fee_negative");
  }

  const virtualSize = transaction.virtualSize();

  if (!Number.isFinite(virtualSize) || virtualSize <= 0) {
    throw new Error("transaction_virtual_size_invalid");
  }

  return feeSats / virtualSize;
}

export function getConfigPayload() {
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
      multiplePerAccount: config.faucet.multiplePerAccount,
      allowRepeatPerAccount: config.faucet.allowRepeatPerAccount
    },
    donations: {
      challengeRotationMs: config.donations.challengeRotationMs,
      heartbeatPollMs: config.donations.heartbeatPollMs,
      activeWindowMs: config.donations.activeWindowMs,
      balanceRefreshMs: config.donations.balanceRefreshMs,
      executionPollMs: config.donations.executionPollMs,
      reservationWindowMs: config.donations.reservationWindowMs,
      feeRateSatPerVbyte: config.donations.feeRateSatPerVbyte,
      minAcceptedSatsVByte: config.donations.minAcceptedSatsVByte,
      broadcastRecoveryMs: config.donations.broadcastRecoveryMs,
      minimumGraffitiBtc: config.donations.minimumGraffitiBtc,
      minimumReputationNeeded: config.donations.minimumReputationNeeded,
      minSatsForHeartbeat: config.donations.minSatsForHeartbeat
    }
  };
}

export async function clearExpiredReservations() {
  const now = new Date();
  const expiredReservations = await models.FaucetRequest.findAll({
    attributes: ["id", "reservedByAddress"],
    where: {
      network: activeNetwork,
      status: "pending",
      reservedByAddress: {
        [Op.ne]: null
      },
      reservationExpiresAt: {
        [Op.lt]: now
      }
    }
  });

  if (!expiredReservations.length) {
    return;
  }

  const donorAddresses = [
    ...new Set(
      expiredReservations
        .map((request) => String(request.reservedByAddress ?? "").trim())
        .filter(Boolean)
    )
  ];
  const requestIds = expiredReservations.map((request) => request.id);

  await models.sequelize.transaction(async (transaction) => {
    await models.FaucetRequest.update(
      {
        reservedByAddress: null,
        reservationExpiresAt: null
      },
      {
        where: {
          id: {
            [Op.in]: requestIds
          },
          network: activeNetwork,
          status: "pending"
        },
        transaction
      }
    );

    for (const donorAddress of donorAddresses) {
      await adjustDonorReputation(donorAddress, -1, transaction);
    }
  });
}

export async function clearExpiredFaucetRequests() {
  const now = new Date();

  await models.FaucetRequest.update(
    {
      status: "expired",
      reservedByAddress: null,
      reservationExpiresAt: null
    },
    {
      where: {
        network: activeNetwork,
        status: "pending",
        expiresAt: {
          [Op.lt]: now
        }
      }
    }
  );
}

export async function backfillFaucetRequestExpiry() {
  const requestsWithoutExpiry = await models.FaucetRequest.findAll({
    where: {
      expiresAt: null
    } as never
  });

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
  }
}

export async function reconcileBroadcastRequests() {
  const broadcastRequests = await models.FaucetRequest.findAll({
    where: {
      network: activeNetwork,
      status: "broadcast",
      fulfillmentTxId: {
        [Op.ne]: null
      }
    },
    order: [["updatedAt", "ASC"]]
  });

  const byTxId = new Map<string, InstanceType<typeof models.FaucetRequest>[]>();

  for (const request of broadcastRequests) {
    if (!request.fulfillmentTxId) {
      continue;
    }
    const existing = byTxId.get(request.fulfillmentTxId) ?? [];
    existing.push(request);
    byTxId.set(request.fulfillmentTxId, existing);
  }

  for (const [txid, requests] of byTxId.entries()) {
    try {
      const txStatus = await getTransactionStatus(txid);
      const requestIds = requests.map((request) => request.id);

      if (!txStatus.confirmed) {
        continue;
      }

      const paidAt =
        txStatus.blocktime != null
          ? new Date(txStatus.blocktime * 1000)
          : new Date();
      const paidByAddress = String(requests[0]?.paidByAddress ?? "").trim();

      await models.sequelize.transaction(async (transaction) => {
        await models.FaucetRequest.update(
          {
            status: "paid",
            paidAt
          },
          {
            where: {
              id: {
                [Op.in]: requestIds
              },
              network: activeNetwork,
              status: "broadcast"
            },
            transaction
          }
        );

        if (paidByAddress) {
          await adjustDonorReputation(paidByAddress, 1, transaction);
        }
      });
    } catch (error) {
      console.error("Unable to reconcile broadcast request", txid, error);
    }
  }
}

export async function reserveNextFaucetRequests(
  donorAddress: string,
  maxRequests: number,
  confirmedBalanceSats: number
) {
  const reservationExpiresAt = new Date(
    Date.now() + config.donations.reservationWindowMs
  );
  const now = new Date();
  const requests = await models.sequelize.transaction(async (transaction) => {
    const donor = await getLockedDonor(donorAddress, transaction);

    if (isDonorBlacklisted(Number(donor.reputation ?? 0))) {
      throw new Error("donor_blacklisted");
    }

    const promised = await getDonorPromisedAmounts(donorAddress, transaction);
    const rows = await models.FaucetRequest.findAll({
      where: {
        network: activeNetwork,
        status: "pending",
        [Op.or]: [
          {
            reservedByAddress: {
              [Op.is]: null
            }
          },
          {
            reservationExpiresAt: {
              [Op.lt]: now
            }
          }
        ]
      },
      order: [["createdAt", "ASC"]],
      limit: maxRequests,
      transaction,
      lock: transaction.LOCK.UPDATE,
      skipLocked: true
    });

    const nextReservationAmountSats = rows.reduce(
      (sum, row) => sum + Number(row.amountSats ?? 0),
      0
    );

    if (
      nextReservationAmountSats > 0 &&
      promised.totalPromisedSats + nextReservationAmountSats > confirmedBalanceSats
    ) {
      donor.reputation = Number(donor.reputation ?? 0) - 1;
      await donor.save({ transaction });
      throw new Error("donor_promised_balance_exceeded");
    }

    for (const row of rows) {
      row.reservedByAddress = donorAddress;
      row.reservationExpiresAt = reservationExpiresAt;
      await row.save({ transaction });
    }

    return rows;
  });

  return {
    reservationExpiresAt,
    requests
  };
}

export function getFrontendBaseUrl(): string {
  return config.host ?? "https://newfreebitcoins.github.io";
}

export function getRequestPageUrl(searchParams?: URLSearchParams): string {
  const url = new URL("/faucet-request/", getFrontendBaseUrl());

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url.toString();
}

export function getMinimumAllowedCreatedAt(): Date {
  const minimum = new Date();
  minimum.setFullYear(
    minimum.getFullYear() - config.faucet.minimumAccountAgeYears
  );
  return minimum;
}

export function getErrorRedirect(code: string): string {
  const searchParams = new URLSearchParams({ error: code });
  return getRequestPageUrl(searchParams);
}

export function getErrorRedirectWithDetail(code: string, detail: string): string {
  const searchParams = new URLSearchParams({
    error: code,
    errorDetail: detail
  });
  return getRequestPageUrl(searchParams);
}

export function setCorsHeaders(response: express.Response) {
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Origin", getFrontendBaseUrl());
}

export function sendFrontendRedirect(
  response: express.Response,
  targetUrl: string
) {
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

export function startMaintenanceIntervals() {
  setInterval(() => {
    void clearExpiredFaucetRequests();
  }, Math.min(config.faucet.requestRefreshTimeoutMs, 60 * 1000)).unref();

  setInterval(() => {
    void clearExpiredReservations();
  }, Math.min(config.donations.reservationWindowMs, 60 * 1000)).unref();

  setInterval(() => {
    void reconcileBroadcastRequests();
  }, config.donations.balanceRefreshMs).unref();
}

export function logXOAuthConfigurationNotice() {
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
}
