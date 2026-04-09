import express from "express";
import { Op } from "sequelize";
import {
  activeNetwork,
  clearExpiredFaucetRequests,
  clearExpiredReservations,
  formatSatsAsBtc,
  getConfigPayload,
  getUnitLabel,
  reconcileBroadcastRequests
} from "../appRuntime.js";
import { models } from "../database/createConnection.js";
import { getDonationBalanceCache } from "../lib/donations.js";

export function registerCommonRoutes(app: express.Router) {
  app.get("/faucet/total-btc", (_request, response) => {
    response.json(getDonationBalanceCache());
  });

  app.get("/faucet/info", (_request, response) => {
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
      multiplePerAccount: payload.faucet.multiplePerAccount,
      allowRepeatPerAccount: payload.faucet.allowRepeatPerAccount
    });
  });

  app.get("/app-config", (_request, response) => {
    response.json(getConfigPayload());
  });

  app.get("/config", (_request, response) => {
    response.json(getConfigPayload());
  });

  app.get("/stats", async (_request, response) => {
    await clearExpiredFaucetRequests();
    await clearExpiredReservations();
    await reconcileBroadcastRequests();
    const donationBalance = getDonationBalanceCache();
    const pendingRequests = await models.FaucetRequest.findAll({
      where: {
        network: activeNetwork,
        status: {
          [Op.in]: ["pending", "broadcast"]
        }
      }
    });

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
}
