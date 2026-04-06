# New Free Bitcoins

New Free Bitcoins is a modern recreation of the original Bitcoin faucet idea.

Instead of keeping all faucet funds inside one centralized server wallet, this project is designed so donors use their own self-custodial donation wallets and send directly to approved faucet claimers.

## What The Faucet Does

- Visitors can request a faucet withdrawal after proving they control a valid Bitcoin address and passing the X account requirements.
- Qualified requests are added to a public pending queue.
- Donors fund the faucet by unlocking a local donation wallet in their browser.
- Donor browsers can actively fulfill queued faucet requests directly from those donation wallets.

## Why The Donation Wallet Exists

This faucet does not use a centralized donation wallet.

The donation wallet flow exists so:

- donors keep custody of their own BTC
- the faucet can estimate how much BTC is actually available from active donors
- fake donation balances are harder to spoof

To support that, active donation wallets must periodically prove control of their address.

## Donation Heartbeat Model

The backend now uses an in-memory challenge and heartbeat system for donation wallets:

1. The server generates a random challenge and rotates it every 10 minutes.
2. Unlocked donation wallets fetch the current challenge every minute.
3. The wallet signs the challenge with the private key behind its Bitcoin address.
4. The wallet posts the address, public key, challenge, and signature to `POST /api/donations/heartbeat`.
5. The backend verifies that:
   - the signature is valid
   - the public key matches the posted Bitcoin address
   - the challenge is current
6. If valid, that address is marked as an active donation wallet.
7. The backend polls Electrum every minute for all active donation wallets and sums their balances.
8. That summed in-memory balance becomes the faucet's current `BTC available` value.

On backend startup, the in-memory donation runtime is initialized immediately:

- a fresh challenge is created
- the active-wallet cache is initialized
- the available-balance cache is prefilled from the current active-wallet set

This makes it much harder for someone to pretend they control a wallet with a huge balance when they do not.

## Donation Fulfillment Flow

When a donation wallet is unlocked, the user can choose how many faucet requests to fulfill per transaction and then start the wallet.

While the wallet is running:

1. The browser heartbeats to the backend so the wallet remains active.
2. The browser asks the backend to reserve the oldest pending faucet requests.
3. Reserved requests are earmarked to that donation wallet for one minute and disappear from the public queue while reserved.
4. The browser builds and signs a Bitcoin transaction locally from the donation wallet.
5. The signed transaction is posted back to the backend.
6. The backend verifies that:
   - the reserved requests still belong to that wallet
   - the transaction pays the reserved withdrawal addresses the correct amounts
   - the transaction spends inputs from the donor wallet address
7. The backend broadcasts the transaction through Electrum.
8. The reserved faucet requests are marked as paid and linked to the broadcast transaction.
9. The donation wallet waits for confirmation before picking up another batch.

This keeps custody in the browser while still letting the backend coordinate the queue safely enough to avoid double-paying the same request.

## Faucet Request Flow

1. A user enters a Bitcoin address on the request page.
2. The backend starts an X OAuth flow.
3. After the callback, the backend checks:
   - minimum X account age
   - verification status
   - whether the user already has a pending request
4. If approved, a pending faucet request is created and stored in SQLite through Sequelize.

## Monorepo Layout

This repo is a Turbo monorepo:

- `apps/frontend`
  - static HTML + JS client meant to be deployable to GitHub Pages
- `apps/backend`
  - Express API
  - Sequelize models
  - Electrum integration
- `apps/donor-cli`
  - Rust CLI donation wallet
  - password-encrypted local mnemonic storage
  - donor commands for `start`, `balance`, `activity`, and `send`

## Important Pages

- `/`
  - homepage
- `/faucet-request/`
  - request faucet withdrawal
- `/pending-requests/`
  - public pending queue
- `/stats/`
  - total held by active donation wallets
  - total left in the pending queue
  - pending faucet request count
  - active donation wallets, paginated and sorted by balance
- `/donate/`
  - create, import, unlock, and use a donation wallet
  - start and stop donation fulfillment
  - inspect recent wallet activity

## Backend Configuration

Main backend config lives in `apps/backend/config.json`.

Important sections:

- `network`
  - currently `mainnet` or `regtest`
  - the frontend pulls this from the backend so the wallet flow stays network agnostic
- `electrum`
  - per-network Electrum server settings
- `explorer`
  - per-network transaction explorer base URLs
- `faucet`
  - claim amount and X-account rules
- `donations`
  - challenge rotation, heartbeat cadence, active window, balance refresh cadence, execution cadence, reservation window, and fee rate
- `database`
  - SQLite now, structured for later Postgres migration

## Frontend Notes

- The frontend is JS-only.
- The donate page uses a generated local bundle so it can run on a static host.
- Donation wallets are encrypted locally in browser storage with a password.
- The mnemonic phrase is still the real backup.
- The donate page includes a direct `send` flow so donors can move funds out of the donation wallet manually.

## Donor CLI

The repo now includes a Rust donor utility at `apps/donor-cli`.

One-command install:

```bash
curl -fsSL https://raw.githubusercontent.com/newfreebitcoins/newfreebitcoins-mono/main/install.sh | sh
```

On first run:

1. The CLI fetches the active backend network.
2. If no local donor wallet exists yet, it creates a new mnemonic phrase.
3. The user must confirm random mnemonic words before the wallet is saved.
4. The mnemonic is encrypted locally with the password passed through `--password`.

Every command requires `--password`.

Available commands:

- `start`
  - starts the donor loop
  - heartbeats the wallet
  - reserves queued requests
  - signs and submits fulfillment transactions
- `balance`
  - shows confirmed and unconfirmed wallet balance
- `activity`
  - shows deposits, faucet fulfillments, and manual sends
- `send`
  - signs and broadcasts a manual transaction out of the donor wallet

Example usage:

```bash
cargo run --manifest-path apps/donor-cli/Cargo.toml -- --password "your-password" balance
cargo run --manifest-path apps/donor-cli/Cargo.toml -- --password "your-password" activity --limit 10
cargo run --manifest-path apps/donor-cli/Cargo.toml -- --password "your-password" send --address bc1... --amount-sats 2500
cargo run --manifest-path apps/donor-cli/Cargo.toml -- --password "your-password" start --max-requests 5
```

If you want to run a donation wallet on a VPS, use the install script above and then run:

```bash
newfreebitcoins --help
```

## Development

Run everything:

```bash
npm run dev
```

Root dev uses Turbo's TUI so frontend and backend run side by side.

The Rust donor CLI is built separately with Cargo:

```bash
cargo build --manifest-path apps/donor-cli/Cargo.toml
```

## Current State

Implemented:

- faucet request flow
- pending request page
- stats page
- local donation wallet creation/import/unlock flow
- active donation wallet heartbeat verification
- backend active-balance cache for `BTC available`
- donation wallet reservation and fulfillment flow
- donation wallet activity feed backed by Electrum and paid faucet-request records

Still evolving:

- production hardening and secret management
