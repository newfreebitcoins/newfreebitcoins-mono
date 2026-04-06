import type { Models } from "../database/createConnection.js";

export type CachedFaucetRequest = {
  id: number;
  network: "mainnet" | "regtest";
  xUserId: string;
  xUsername: string;
  xName: string | null;
  xCreatedAt: Date;
  xVerified: boolean;
  bitcoinAddress: string;
  amountSats: number;
  status: "pending" | "broadcast" | "expired" | "rejected" | "paid";
  expiresAt: Date | null;
  refreshSecretHash: string | null;
  reservedByAddress: string | null;
  reservationExpiresAt: Date | null;
  fulfillmentTxId: string | null;
  paidByAddress: string | null;
  paidAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const faucetRequestCache = new Map<number, CachedFaucetRequest>();

function toCachedRequest(row: {
  id: number;
  network: "mainnet" | "regtest";
  xUserId: string;
  xUsername: string;
  xName: string | null;
  xCreatedAt: Date;
  xVerified: boolean;
  bitcoinAddress: string;
  amountSats: number;
  status: "pending" | "broadcast" | "expired" | "rejected" | "paid";
  expiresAt: Date | null;
  refreshSecretHash: string | null;
  reservedByAddress: string | null;
  reservationExpiresAt: Date | null;
  fulfillmentTxId: string | null;
  paidByAddress: string | null;
  paidAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CachedFaucetRequest {
  return {
    ...row,
    xCreatedAt: new Date(row.xCreatedAt),
    expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
    reservationExpiresAt: row.reservationExpiresAt
      ? new Date(row.reservationExpiresAt)
      : null,
    paidAt: row.paidAt ? new Date(row.paidAt) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  };
}

export async function hydrateFaucetRequestCache(models: Models) {
  const rows = await models.FaucetRequest.findAll();
  faucetRequestCache.clear();

  for (const row of rows) {
    faucetRequestCache.set(
      row.id,
      toCachedRequest({
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
      })
    );
  }
}

export function upsertCachedFaucetRequest(
  row: CachedFaucetRequest | (CachedFaucetRequest & { id: number })
) {
  faucetRequestCache.set(row.id, toCachedRequest(row));
}

export function removeCachedFaucetRequest(id: number) {
  faucetRequestCache.delete(id);
}

export function getCachedFaucetRequest(id: number) {
  return faucetRequestCache.get(id) ?? null;
}

export function getAllCachedFaucetRequests(network?: "mainnet" | "regtest") {
  const rows = [...faucetRequestCache.values()];
  return network ? rows.filter((row) => row.network === network) : rows;
}

export function getCachedFaucetRequestsByFilter(
  network: "mainnet" | "regtest",
  predicate: (row: CachedFaucetRequest) => boolean
) {
  return getAllCachedFaucetRequests(network).filter(predicate);
}
