import express from "express";
import { Transaction as BitcoinTransaction, address as bitcoinAddress } from "bitcoinjs-lib";
import { Op } from "sequelize";
import {
  activeNetwork,
  clearExpiredFaucetRequests,
  clearExpiredReservations,
  config,
  formatSatsAsBtc,
  getDonorStatus,
  getExplorerTxUrl,
  getTransactionFeeRateSatPerVbyte,
  reconcileBroadcastRequests,
  releaseReservationsForDonorRequestIds,
  reserveNextFaucetRequests,
  validateTransactionInputsConfirmed,
  validateTransactionInputsOwnedByAddress
} from "../appRuntime.js";
import { models } from "../database/createConnection.js";
import {
  getBitcoinNetwork,
  isValidBitcoinAddress
} from "../lib/bitcoin.js";
import {
  getActiveDonationWalletsPage,
  getDonationChallenge,
  isDonationWalletActive,
  recordDonationHeartbeat,
  validateDonationHeartbeat
} from "../lib/donations.js";
import {
  broadcastTransaction,
  getAddressHistory,
  getAddressUtxos,
  getPreviousOutput,
  getTransactionHex,
  getTransactionStatus
} from "../lib/esplora.js";

export function registerDonationRoutes(app: express.Router) {
  app.get("/donations/challenge", (_request, response) => {
    response.json(getDonationChallenge());
  });

  app.get("/donations/donor-status", async (request, response) => {
    const address = String(request.query.address ?? "").trim();

    if (!isValidBitcoinAddress(address)) {
      response.status(400).json({ error: "invalid_bitcoin_address" });
      return;
    }

    await clearExpiredReservations();
    await reconcileBroadcastRequests();

    try {
      response.json(await getDonorStatus(address));
    } catch (error) {
      console.error(error);
      response.status(502).json({ error: "donor_status_lookup_failed" });
    }
  });

  app.post("/donations/heartbeat", async (request, response) => {
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
      const validatedHeartbeat = validateDonationHeartbeat({
        address,
        publicKeyHex,
        challenge,
        signatureHex,
        graffiti
      });
      const donorStatus = await getDonorStatus(address);

      if (donorStatus.isBlacklisted) {
        response.status(403).json({ error: "donor_blacklisted" });
        return;
      }

      if (donorStatus.confirmedBalanceSats < config.donations.minSatsForHeartbeat) {
        response
          .status(403)
          .json({ error: "donor_balance_below_heartbeat_minimum" });
        return;
      }

      const donationBalance = recordDonationHeartbeat({
        ...validatedHeartbeat,
        balanceSats: donorStatus.confirmedBalanceSats,
        unconfirmedBalanceSats: donorStatus.unconfirmedBalanceSats
      });

      response.json({
        ok: true,
        ...donationBalance,
        donor: donorStatus
      });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "invalid_donation_heartbeat";

      response.status(400).json({
        error: detail
      });
    }
  });

  app.get("/donations/active-wallets", (request, response) => {
    const page = Math.max(Number(request.query.page ?? 1) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number(request.query.pageSize ?? 10) || 10, 1),
      50
    );

    response.json(getActiveDonationWalletsPage(page, pageSize));
  });

  app.get("/donations/wallet-utxos", async (request, response) => {
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

  app.get("/donations/tx-status", async (request, response) => {
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

  app.get("/donations/activity", async (request, response) => {
    const address = String(request.query.address ?? "").trim();
    const limit = Math.min(Math.max(Number(request.query.limit ?? 15) || 15, 1), 50);

    if (!isValidBitcoinAddress(address)) {
      response.status(400).json({ error: "invalid_bitcoin_address" });
      return;
    }

    try {
      const history = await getAddressHistory(address);
      await reconcileBroadcastRequests();
      const paidRequests = await models.FaucetRequest.findAll({
        where: {
          network: activeNetwork,
          paidByAddress: address,
          fulfillmentTxId: {
            [Op.ne]: null
          },
          status: "paid"
        },
        order: [["paidAt", "DESC"], ["updatedAt", "DESC"]]
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

  app.post("/donations/send-transaction", async (request, response) => {
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
      const feeRateSatPerVbyte = await getTransactionFeeRateSatPerVbyte(transaction);

      if (feeRateSatPerVbyte < config.donations.minAcceptedSatsVByte) {
        response.status(400).json({ error: "transaction_fee_rate_below_minimum" });
        return;
      }

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

  app.post("/donations/reserve-requests", async (request, response) => {
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
    await reconcileBroadcastRequests();

    const donorStatus = await getDonorStatus(donorAddress);

    if (donorStatus.isBlacklisted) {
      response.status(403).json({ error: "donor_blacklisted" });
      return;
    }

    if (donorStatus.confirmedBalanceSats < config.donations.minSatsForHeartbeat) {
      response
        .status(403)
        .json({ error: "donor_balance_below_heartbeat_minimum" });
      return;
    }

    try {
      const { reservationExpiresAt, requests: reservedRequests } =
        await reserveNextFaucetRequests(
          donorAddress,
          maxRequests,
          donorStatus.confirmedBalanceSats
        );
      const nextDonorStatus = await getDonorStatus(donorAddress);

      response.json({
        donorAddress,
        reservationExpiresAt: reservationExpiresAt.toISOString(),
        donor: nextDonorStatus,
        requests: reservedRequests.map((row) => ({
          id: row.id,
          bitcoinAddress: row.bitcoinAddress,
          amountSats: row.amountSats,
          amountBtc: formatSatsAsBtc(Number(row.amountSats ?? 0)),
          createdAt: row.createdAt,
          xUsername: row.xUsername
        }))
      });
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "donation_reservation_failed";
      const statusCode =
        detail === "donor_blacklisted"
          ? 403
          : detail === "donor_promised_balance_exceeded"
            ? 409
            : 502;
      response.status(statusCode).json({ error: detail });
    }
  });

  app.post("/donations/submit-fulfillment", async (request, response) => {
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
    const reservedRequests = await models.FaucetRequest.findAll({
      where: {
        id: {
          [Op.in]: requestIds
        },
        network: activeNetwork,
        status: "pending",
        reservedByAddress: donorAddress,
        reservationExpiresAt: {
          [Op.gt]: new Date()
        }
      },
      order: [["createdAt", "ASC"]]
    });

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
      await validateTransactionInputsConfirmed(transaction);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "transaction_uses_unconfirmed_inputs";

      if (message === "transaction_uses_unconfirmed_inputs") {
        await releaseReservationsForDonorRequestIds(donorAddress, requestIds, -1);
      }

      response.status(400).json({ error: message });
      return;
    }

    try {
      const feeRateSatPerVbyte = await getTransactionFeeRateSatPerVbyte(transaction);

      if (feeRateSatPerVbyte < config.donations.minAcceptedSatsVByte) {
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
            }
          }
        );

        response.status(400).json({ error: "transaction_fee_rate_below_minimum" });
        return;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "transaction_fee_rate_invalid";
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
}
