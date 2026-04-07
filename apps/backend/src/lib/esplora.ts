import { loadConfig } from "../config.js";

type EsploraAddressStats = {
  funded_txo_sum?: number;
  spent_txo_sum?: number;
};

type EsploraAddressResponse = {
  chain_stats?: EsploraAddressStats;
  mempool_stats?: EsploraAddressStats;
};

type EsploraTxStatus = {
  confirmed?: boolean;
  block_height?: number;
  block_time?: number;
};

type EsploraAddressTx = {
  txid?: string;
  status?: EsploraTxStatus;
};

type EsploraUtxo = {
  txid?: string;
  vout?: number;
  value?: number;
  status?: EsploraTxStatus;
};

type EsploraTxOutput = {
  value?: number;
  scriptpubkey?: string;
  scriptpubkey_address?: string;
};

type EsploraTxResponse = {
  txid?: string;
  vout?: EsploraTxOutput[];
  status?: EsploraTxStatus;
};

let cachedTipHeight: { value: number; fetchedAt: number } | null = null;

function getActiveElectrsBaseUrl(): string {
  const config = loadConfig();
  return config.electrs[config.network].baseUrl.replace(/\/+$/, "");
}

async function fetchEsplora(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(`${getActiveElectrsBaseUrl()}${path}`, init);

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `electrs_request_failed_${response.status}${
        detail ? `: ${detail}` : ""
      }`
    );
  }

  return response;
}

async function fetchEsploraJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchEsplora(path, init);
  return (await response.json()) as T;
}

async function fetchEsploraText(path: string, init?: RequestInit): Promise<string> {
  const response = await fetchEsplora(path, init);
  return await response.text();
}

async function getTipHeight(): Promise<number> {
  if (cachedTipHeight && Date.now() - cachedTipHeight.fetchedAt < 5_000) {
    return cachedTipHeight.value;
  }

  const text = await fetchEsploraText("/blocks/tip/height");
  const value = Number(text.trim());

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("electrs_tip_height_invalid");
  }

  cachedTipHeight = {
    value,
    fetchedAt: Date.now()
  };

  return value;
}

function getNetDelta(stats?: EsploraAddressStats): number {
  return Math.max(
    Number(stats?.funded_txo_sum ?? 0) - Number(stats?.spent_txo_sum ?? 0),
    0
  );
}

async function getAddressTransactions(
  address: string,
  limit = 100
): Promise<EsploraAddressTx[]> {
  const encodedAddress = encodeURIComponent(address);
  const initial = await fetchEsploraJson<EsploraAddressTx[]>(
    `/address/${encodedAddress}/txs`
  );

  if (!Array.isArray(initial) || initial.length >= limit) {
    return Array.isArray(initial) ? initial.slice(0, limit) : [];
  }

  const transactions = [...initial];
  let lastSeenTxid = transactions.at(-1)?.txid ?? "";

  while (transactions.length < limit && lastSeenTxid) {
    const nextPage = await fetchEsploraJson<EsploraAddressTx[]>(
      `/address/${encodedAddress}/txs/chain/${encodeURIComponent(lastSeenTxid)}`
    );

    if (!Array.isArray(nextPage) || !nextPage.length) {
      break;
    }

    for (const transaction of nextPage) {
      if (transactions.length >= limit) {
        break;
      }

      if (!transaction?.txid || transactions.some((item) => item.txid === transaction.txid)) {
        continue;
      }

      transactions.push(transaction);
    }

    lastSeenTxid = nextPage.at(-1)?.txid ?? "";
  }

  return transactions;
}

export async function getAddressBalance(address: string) {
  const payload = await fetchEsploraJson<EsploraAddressResponse>(
    `/address/${encodeURIComponent(address)}`
  );

  return {
    confirmed: getNetDelta(payload.chain_stats),
    unconfirmed: getNetDelta(payload.mempool_stats)
  };
}

export async function getAddressHistory(address: string) {
  const history = await getAddressTransactions(address);

  return history
    .filter((entry) => entry?.txid)
    .map((entry) => ({
      tx_hash: String(entry.txid),
      height: Number(entry.status?.block_height ?? 0)
    }));
}

export async function getAddressUtxos(address: string) {
  const utxos = await fetchEsploraJson<EsploraUtxo[]>(
    `/address/${encodeURIComponent(address)}/utxo`
  );

  if (!Array.isArray(utxos)) {
    return [];
  }

  return utxos.map((entry) => ({
    txid: String(entry.txid ?? ""),
    vout: Number(entry.vout ?? 0),
    value: Number(entry.value ?? 0),
    height: entry.status?.confirmed ? Number(entry.status?.block_height ?? 0) : 0
  }));
}

export async function getTransactionHex(txid: string) {
  return await fetchEsploraText(`/tx/${encodeURIComponent(txid)}/hex`);
}

export async function getTransactionStatus(txid: string) {
  const status = await fetchEsploraJson<EsploraTxStatus>(
    `/tx/${encodeURIComponent(txid)}/status`
  );

  const confirmed = Boolean(status?.confirmed);
  const blockHeight = Number(status?.block_height ?? 0);
  let confirmations = 0;

  if (confirmed && blockHeight > 0) {
    const tipHeight = await getTipHeight().catch(() => 0);
    confirmations = tipHeight >= blockHeight ? tipHeight - blockHeight + 1 : 0;
  }

  return {
    txid,
    confirmations,
    confirmed,
    blocktime:
      Number(status?.block_time ?? 0) > 0 ? Number(status?.block_time) : null
  };
}

export async function broadcastTransaction(rawTransactionHex: string) {
  const txid = await fetchEsploraText("/tx", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: rawTransactionHex
  });

  return txid.trim();
}

export async function getPreviousOutput(
  txid: string,
  vout: number
): Promise<{ value: number; scriptHex: string; address: string | null }> {
  const transaction = await fetchEsploraJson<EsploraTxResponse>(
    `/tx/${encodeURIComponent(txid)}`
  );
  const output = transaction.vout?.[vout];

  if (!output) {
    throw new Error("previous_output_not_found");
  }

  return {
    value: Number(output.value ?? 0),
    scriptHex: String(output.scriptpubkey ?? ""),
    address: output.scriptpubkey_address ?? null
  };
}
