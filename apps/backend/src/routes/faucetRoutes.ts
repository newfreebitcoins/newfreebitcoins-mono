import express from "express";
import { Op } from "sequelize";
import {
  activeNetwork,
  clearExpiredFaucetRequests,
  clearExpiredReservations,
  config,
  createRefreshSecret,
  formatSatsAsBtc,
  getErrorRedirect,
  getErrorRedirectWithDetail,
  getExplorerTxUrl,
  getFaucetRequestExpiresAt,
  getFaucetRequestLockKey,
  getMinimumAllowedCreatedAt,
  getRequestPageUrl,
  hashRefreshSecret,
  isRefreshSecretValid,
  reconcileBroadcastRequests,
  sendFrontendRedirect,
  serializeFaucetRequest
} from "../appRuntime.js";
import { models } from "../database/createConnection.js";
import { isValidBitcoinAddress } from "../lib/bitcoin.js";
import {
  buildXAuthorizationUrl,
  createOAuthState,
  createPkcePair,
  exchangeCodeForToken,
  getXUserProfile,
  isVerifiedXUser
} from "../lib/xOAuth.js";

type ClaimedOAuthState =
  | {
      error: "x_oauth_state_missing" | "x_oauth_session_mismatch";
      oauthState?: never;
    }
  | {
      error?: never;
      oauthState: {
        bitcoinAddress: string;
        codeVerifier: string;
      };
    };

async function claimOAuthRequestState(
  state: string,
  sessionSecret: string
): Promise<ClaimedOAuthState> {
  return await models.sequelize.transaction(async (transaction) => {
    const oauthState = await models.OAuthRequestState.findOne({
      where: {
        state,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!oauthState) {
      return {
        error: "x_oauth_state_missing"
      };
    }

    const expectedSessionSecretHash = String(
      oauthState.sessionSecretHash ?? ""
    ).trim();
    const actualSessionSecretHash = sessionSecret
      ? hashRefreshSecret(sessionSecret)
      : "";

    if (
      !expectedSessionSecretHash ||
      !sessionSecret ||
      actualSessionSecretHash !== expectedSessionSecretHash
    ) {
      await oauthState.destroy({ transaction });
      return {
        error: "x_oauth_session_mismatch"
      };
    }

    const claimedState = {
      bitcoinAddress: oauthState.bitcoinAddress,
      codeVerifier: oauthState.codeVerifier
    };

    await oauthState.destroy({ transaction });

    return {
      oauthState: claimedState
    };
  });
}

async function createFaucetRequestFromOAuthState(oauthState: {
  bitcoinAddress: string;
  codeVerifier: string;
}, authorizationCode: string) {
  const accessToken = await exchangeCodeForToken(authorizationCode, oauthState.codeVerifier);
  const xUser = await getXUserProfile(accessToken);
  const createdAt = new Date(xUser.created_at);

  if (Number.isNaN(createdAt.valueOf())) {
    throw new Error("X account created_at was invalid");
  }

  if (createdAt > getMinimumAllowedCreatedAt()) {
    console.error("X account too new:", xUser.username, xUser.created_at);
    throw new Error("x_account_too_new");
  }

  const xUserIsVerified = isVerifiedXUser(xUser);

  await clearExpiredFaucetRequests();

  if (config.faucet.requireVerified && !xUserIsVerified) {
    console.error("X account not verified:", xUser.username, xUser);
    throw new Error("x_account_not_verified");
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

    const existingRequest = config.faucet.multiplePerAccount
      ? null
      : await models.FaucetRequest.findOne({
          where: config.faucet.allowRepeatPerAccount
            ? {
                network: activeNetwork,
                xUserId: xUser.id,
                status: "pending"
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

    return await models.FaucetRequest.create(
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

  console.error("Created faucet request:", createdRequest.id, xUser.username);

  return {
    createdRequest,
    refreshToken
  };
}

export function registerFaucetRoutes(app: express.Router) {
  app.get("/faucet/request/:requestId", async (request, response) => {
    const requestId = Number(request.params.requestId);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      response.status(400).json({ error: "invalid_request_id" });
      return;
    }

    await clearExpiredFaucetRequests();
    await reconcileBroadcastRequests();
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

    response.json({
      ...serializeFaucetRequest(faucetRequest),
      requestRefreshTimeoutMs: config.faucet.requestRefreshTimeoutMs
    });
  });

  app.post("/faucet/request/:requestId/refresh", async (request, response) => {
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

    if (config.faucet.requireVerified && !faucetRequest.xVerified) {
      await faucetRequest.destroy();
      response.status(403).json({ error: "x_account_not_verified" });
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

    response.json({
      ok: true,
      request: {
        ...serializeFaucetRequest(faucetRequest),
        requestRefreshTimeoutMs: config.faucet.requestRefreshTimeoutMs
      }
    });
  });

  app.post("/faucet/request/:requestId/cancel", async (request, response) => {
    const requestId = Number(request.params.requestId);
    const refreshToken = String(request.body?.refreshToken ?? "").trim();

    if (!Number.isInteger(requestId) || requestId <= 0) {
      response.status(400).json({ error: "invalid_request_id" });
      return;
    }

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

    if (
      faucetRequest.status !== "pending" &&
      faucetRequest.status !== "expired" &&
      faucetRequest.status !== "rejected"
    ) {
      response.status(409).json({ error: "request_not_cancellable" });
      return;
    }

    await faucetRequest.destroy();

    response.json({
      ok: true
    });
  });

  app.post("/faucet/request/start", async (request, response) => {
    const bitcoinAddress = String(request.body?.bitcoinAddress ?? "").trim();
    const sessionSecret = String(request.body?.sessionSecret ?? "").trim();

    if (!isValidBitcoinAddress(bitcoinAddress)) {
      response.status(400).json({ error: "invalid_bitcoin_address" });
      return;
    }

    if (sessionSecret.length < 32) {
      response.status(400).json({ error: "invalid_oauth_session_secret" });
      return;
    }

    const { codeVerifier, codeChallenge } = createPkcePair();
    const state = createOAuthState();

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

    response.json({
      state,
      authorizationUrl: buildXAuthorizationUrl(state, codeChallenge)
    });
  });

  app.get("/x_oauth2_callback", async (request, response) => {
    const code = String(request.query.code ?? "");
    const state = String(request.query.state ?? "");
    const oauthError = String(request.query.error ?? "");

    if (oauthError) {
      console.error("X OAuth denied:", oauthError);
      if (state) {
        await models.OAuthRequestState.destroy({
          where: {
            state
          }
        });
      }
      sendFrontendRedirect(response, getErrorRedirect("x_oauth_denied"));
      return;
    }

    if (!code || !state) {
      console.error("X OAuth callback missing code or state");
      sendFrontendRedirect(response, getErrorRedirect("x_oauth_invalid_callback"));
      return;
    }

    try {
      const oauthState = await models.OAuthRequestState.findOne({
        where: {
          state,
          expiresAt: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!oauthState) {
        console.error("X OAuth callback rejected: x_oauth_state_missing", state);
        sendFrontendRedirect(response, getErrorRedirect("x_oauth_state_missing"));
        return;
      }

      const redirectUrl = new URL(getRequestPageUrl());
      redirectUrl.hash = new URLSearchParams({
        oauthState: state,
        oauthCode: code,
        oauthStatus: "ready"
      }).toString();

      sendFrontendRedirect(
        response,
        redirectUrl.toString()
      );
    } catch (error) {
      console.error(error);
      const detail =
        error instanceof Error ? error.message : "Unknown OAuth callback error";

      sendFrontendRedirect(
        response,
        getErrorRedirectWithDetail("x_oauth_request_failed", detail)
      );
    }
  });

  app.post("/faucet/request/complete", async (request, response) => {
    const state = String(request.body?.state ?? "").trim();
    const code = String(request.body?.code ?? "").trim();
    const sessionSecret = String(request.body?.sessionSecret ?? "").trim();

    if (!state || !sessionSecret || !code) {
      response.status(400).json({ error: "x_oauth_invalid_callback" });
      return;
    }

    const claimedOAuthState = await claimOAuthRequestState(state, sessionSecret);

    if (claimedOAuthState.error) {
      console.error("X OAuth callback rejected:", claimedOAuthState.error, state);
      response.status(403).json({ error: claimedOAuthState.error });
      return;
    }

    try {
      const { createdRequest, refreshToken } = await createFaucetRequestFromOAuthState(
        claimedOAuthState.oauthState,
        code
      );

      response.json({
        ok: true,
        requestId: createdRequest.id,
        refreshToken
      });
    } catch (error) {
      console.error(error);
      const detail =
        error instanceof Error ? error.message : "Unknown OAuth completion error";

      if (
        detail === "request_already_pending" ||
        detail === "x_account_too_new" ||
        detail === "x_account_not_verified"
      ) {
        response.status(403).json({ error: detail });
        return;
      }

      response.status(502).json({
        error: "x_oauth_request_failed",
        errorDetail: detail
      });
    }
  });

  app.get("/faucet/pending-requests", async (request, response) => {
    await clearExpiredFaucetRequests();
    await clearExpiredReservations();
    await reconcileBroadcastRequests();
    const page = Math.max(Number(request.query.page ?? 1) || 1, 1);
    const pageSize = Math.min(Math.max(Number(request.query.pageSize ?? 10) || 10, 1), 50);
    const offset = (page - 1) * pageSize;

    const { rows, count } = await models.FaucetRequest.findAndCountAll({
      where: {
        network: activeNetwork,
        status: "pending",
        reservedByAddress: {
          [Op.is]: null
        }
      },
      order: [["createdAt", "ASC"]],
      offset,
      limit: pageSize
    });

    response.json({
      page,
      pageSize,
      totalCount: count,
      totalPages: Math.max(Math.ceil(count / pageSize), 1),
      requests: rows.map((row) => ({
        id: row.id,
        xUsername: row.xUsername,
        xName: row.xName,
        bitcoinAddress: row.bitcoinAddress,
        amountSats: row.amountSats,
        createdAt: row.createdAt
      }))
    });
  });

  app.get("/faucet/recent-sends", async (request, response) => {
    await reconcileBroadcastRequests();
    const page = Math.max(Number(request.query.page ?? 1) || 1, 1);
    const pageSize = Math.min(Math.max(Number(request.query.pageSize ?? 10) || 10, 1), 50);
    const offset = (page - 1) * pageSize;

    const { rows, count } = await models.FaucetRequest.findAndCountAll({
      where: {
        network: activeNetwork,
        status: "paid",
        fulfillmentTxId: {
          [Op.ne]: null
        }
      },
      order: [["paidAt", "DESC"], ["updatedAt", "DESC"]],
      offset,
      limit: pageSize
    });

    response.json({
      page,
      pageSize,
      totalCount: count,
      totalPages: Math.max(Math.ceil(count / pageSize), 1),
      sends: rows.map((row) => ({
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
}
