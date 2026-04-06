import crypto from "node:crypto";
import {
  Transaction,
  address as bitcoinAddress,
  networks
} from "bitcoinjs-lib";
import ElectrumClient from "electrum-client";
import { loadConfig } from "../config.js";

function getBitcoinNetwork() {
  const config = loadConfig();
  return config.network === "mainnet" ? networks.bitcoin : networks.regtest;
}

function getElectrumServer() {
  const config = loadConfig();
  return config.electrum[config.network];
}

function getScriptHash(address: string): string {
  const output = bitcoinAddress.toOutputScript(address, getBitcoinNetwork());
  const sha256 = crypto.createHash("sha256").update(output).digest();
  return Buffer.from(sha256.reverse()).toString("hex");
}

async function withElectrumClient<T>(
  handler: (client: any) => Promise<T>
): Promise<T> {
  const electrum = getElectrumServer();
  const client = new ElectrumClient(
    electrum.port,
    electrum.host,
    electrum.protocol
  );

  try {
    await client.connect();
    await client.server_version("new-free-bitcoins", "1.4");
    return await handler(client);
  } finally {
    client.close();
  }
}

export async function getAddressBalance(address: string) {
  return withElectrumClient(async (client) => {
    const balance = await client.blockchainScripthash_getBalance(
      getScriptHash(address)
    );

    return {
      confirmed: Number(balance.confirmed ?? 0),
      unconfirmed: Number(balance.unconfirmed ?? 0)
    };
  });
}

export async function getAddressHistory(address: string) {
  return withElectrumClient(async (client) => {
    const history = await client.request("blockchain.scripthash.get_history", [
      getScriptHash(address)
    ]);

    if (!Array.isArray(history)) {
      return [];
    }

    return history.map((entry) => ({
      tx_hash: String(entry.tx_hash ?? ""),
      height: Number(entry.height ?? 0)
    }));
  });
}

export async function getAddressUtxos(address: string) {
  return withElectrumClient(async (client) => {
    const utxos = await client.request("blockchain.scripthash.listunspent", [
      getScriptHash(address)
    ]);

    if (!Array.isArray(utxos)) {
      return [];
    }

    return utxos.map((entry) => ({
      txid: String(entry.tx_hash ?? ""),
      vout: Number(entry.tx_pos ?? 0),
      value: Number(entry.value ?? 0),
      height: Number(entry.height ?? 0)
    }));
  });
}

export async function getTransactionHex(txid: string) {
  return withElectrumClient(async (client) => {
    const rawTransaction = await client.request("blockchain.transaction.get", [
      txid,
      false
    ]);

    return String(rawTransaction ?? "");
  });
}

export async function getTransactionStatus(txid: string) {
  return withElectrumClient(async (client) => {
    const tx = await client.request("blockchain.transaction.get", [txid, true]);

    const confirmations = Number(tx?.confirmations ?? 0);
    const blocktime = Number(tx?.blocktime ?? 0);

    return {
      txid,
      confirmations,
      confirmed: confirmations > 0,
      blocktime: blocktime > 0 ? blocktime : null
    };
  });
}

export async function broadcastTransaction(rawTransactionHex: string) {
  return withElectrumClient(async (client) => {
    const txid = await client.request("blockchain.transaction.broadcast", [
      rawTransactionHex
    ]);

    return String(txid ?? "");
  });
}

export async function getPreviousOutput(
  txid: string,
  vout: number
): Promise<{ value: number; scriptHex: string; address: string | null }> {
  const rawTransactionHex = await getTransactionHex(txid);
  const transaction = Transaction.fromHex(rawTransactionHex);
  const output = transaction.outs[vout];

  if (!output) {
    throw new Error("previous_output_not_found");
  }

  let address: string | null = null;

  try {
    address = bitcoinAddress.fromOutputScript(output.script, getBitcoinNetwork());
  } catch {
    address = null;
  }

  return {
    value: Number(output.value),
    scriptHex: Buffer.from(output.script).toString("hex"),
    address
  };
}
