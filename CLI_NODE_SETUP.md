# CLI Node Setup

This document explains how to run the Rust donor CLI against a local Bitcoin regtest setup.

The important detail is:

- the CLI talks to the backend
- the backend talks to Electrum
- Electrum talks to your Bitcoin node

So you do **not** point the CLI directly at `bitcoind`.

## What You Need

You need:

1. a Bitcoin node
2. an Electrum-compatible server
3. the backend configured to use that Electrum server
4. the frontend/backend dev stack running

## Recommended Local Regtest Stack

Use:

1. `bitcoind` in `regtest`
2. `electrs` pointed at that regtest node

## Step 1: Start Bitcoin Core In Regtest

Example:

```powershell
bitcoind -regtest -server=1 -txindex=1 -fallbackfee=0.0002 -rpcuser=bitcoin -rpcpassword=bitcoin -rpcport=18443
```

Notes:

- `-regtest` enables local regtest mode
- `-server=1` enables RPC
- `-txindex=1` helps transaction lookups
- `-fallbackfee=0.0002` makes local send testing easier

## Step 2: Start Electrs

Example:

```powershell
electrs --network regtest --daemon-rpc-addr 127.0.0.1:18443 --cookie "bitcoin:bitcoin" --electrum-rpc-addr 127.0.0.1:50001
```

Depending on your setup, you may also need to pass your Bitcoin data dir:

```powershell
electrs --network regtest --daemon-dir "C:\\path\\to\\bitcoin\\datadir" --daemon-rpc-addr 127.0.0.1:18443 --cookie "bitcoin:bitcoin" --electrum-rpc-addr 127.0.0.1:50001
```

## Step 3: Configure The Backend

Open:

- [apps/backend/config.json](C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/config.json)

Make sure:

```json
{
  "network": "regtest",
  "electrum": {
    "regtest": {
      "host": "127.0.0.1",
      "port": 50001,
      "ssl": false
    }
  }
}
```

Also make sure your explorer config is sensible for regtest, or leave it empty if you do not need tx links.

## Step 4: Start The App Stack

From the repo root:

```powershell
npm run dev
```

That starts:

- frontend on `http://localhost:3000`
- backend on `http://localhost:4669`

## Step 5: Build Or Run The CLI

Build it:

```powershell
cargo build --manifest-path apps/donor-cli/Cargo.toml
```

Or run it directly:

```powershell
cargo run --manifest-path apps/donor-cli/Cargo.toml -- --backend "http://localhost:4669" --password "testpass" balance
```

## First Run Behavior

On first run, the CLI will:

1. fetch backend config
2. detect the active backend network
3. create a new donor wallet if none exists yet
4. show a mnemonic phrase
5. ask you to confirm random words
6. encrypt and save the wallet locally

After that, every command requires:

- `--password`

## CLI Commands

### Balance

```powershell
cargo run --manifest-path apps/donor-cli/Cargo.toml -- --backend "http://localhost:4669" --password "testpass" balance
```

Shows:

- wallet address
- confirmed balance
- unconfirmed balance

### Activity

```powershell
cargo run --manifest-path apps/donor-cli/Cargo.toml -- --backend "http://localhost:4669" --password "testpass" activity --limit 10
```

Shows:

- deposits
- faucet fulfillments
- manual sends

### Send

```powershell
cargo run --manifest-path apps/donor-cli/Cargo.toml -- --backend "http://localhost:4669" --password "testpass" send --address bcrt1... --amount-sats 2500
```

This:

1. loads and decrypts the donor wallet
2. fetches confirmed UTXOs from the backend
3. builds and signs a transaction locally
4. submits the signed transaction to the backend for broadcast

### Start

```powershell
cargo run --manifest-path apps/donor-cli/Cargo.toml -- --backend "http://localhost:4669" --password "testpass" start --max-requests 5
```

This starts the donor loop:

1. heartbeat the wallet
2. reserve queued faucet requests
3. build and sign a fulfillment transaction
4. submit it to the backend
5. wait for confirmation
6. continue with the next batch

## Funding The Donor Wallet On Regtest

After the CLI creates a wallet, copy the wallet address and fund it from Bitcoin Core.

Example:

```powershell
bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=bitcoin generatetoaddress 101 bcrt1...
bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=bitcoin sendtoaddress bcrt1... 1
bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=bitcoin generatetoaddress 1 bcrt1...
```

That:

1. mines spendable regtest coins
2. sends funds to the donor wallet
3. confirms the send

## Common Problems

### CLI says the network does not match

Your saved CLI wallet was created for a different backend network.

For example:

- wallet created on `mainnet`
- backend now running on `regtest`

Delete the saved CLI wallet and rerun the command to create a new one for the current network.

### CLI cannot find balance or activity

Usually this means:

1. Electrum is not running
2. the backend Electrum config is wrong
3. your node has not indexed or confirmed the transaction yet

### The donor loop says there are no queued faucet requests

That just means the backend currently has no eligible pending requests for this network.

## Where The CLI Wallet Is Stored

The donor CLI stores an encrypted wallet file in your local app-data directory under:

- `NewFreeBitcoins/donor-wallet.json`

The mnemonic is encrypted with the password you pass in through `--password`.

The password is **not** the backup. The mnemonic is still the real backup.
