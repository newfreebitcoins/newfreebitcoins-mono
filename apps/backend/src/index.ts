import express from "express";
import {
  backfillFaucetRequestExpiry,
  clearExpiredFaucetRequests,
  clearExpiredReservations,
  config,
  logXOAuthConfigurationNotice,
  reconcileBroadcastRequests,
  startMaintenanceIntervals
} from "./appRuntime.js";
import { databaseConnection } from "./database/createConnection.js";
import { startDonationRuntime } from "./lib/donations.js";
import { createApiRouter } from "./routes/index.js";

const app = express();
app.use("/api", createApiRouter());

async function start() {
  await databaseConnection();
  await backfillFaucetRequestExpiry();
  await startDonationRuntime();
  await clearExpiredFaucetRequests();
  await clearExpiredReservations();
  await reconcileBroadcastRequests();
  startMaintenanceIntervals();
  logXOAuthConfigurationNotice();

  app.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
}

void start();
