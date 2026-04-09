import express from "express";
import { getAddressBalance } from "../lib/esplora.js";
import { isValidBitcoinAddress } from "../lib/bitcoin.js";

export function registerWalletRoutes(app: express.Router) {
  app.get("/wallet/balance", async (request, response) => {
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
}
