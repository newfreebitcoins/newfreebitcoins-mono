import express from "express";
import { registerCommonRoutes } from "./commonRoutes.js";
import { registerDebugRoutes } from "./debugRoutes.js";
import { registerDonationRoutes } from "./donationRoutes.js";
import { registerFaucetRoutes } from "./faucetRoutes.js";
import { registerGlobalMiddleware } from "./middleware.js";
import { registerWalletRoutes } from "./walletRoutes.js";

export function createApiRouter() {
  const router = express.Router();

  registerGlobalMiddleware(router);
  registerCommonRoutes(router);
  registerDonationRoutes(router);
  registerDebugRoutes(router);
  registerFaucetRoutes(router);
  registerWalletRoutes(router);

  return router;
}
