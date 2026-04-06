# Donation Wallet Remediation Scope

Date: 2026-04-05

This document summarizes the fixes made after the pre-regtest audit of the donation-wallet execution flow.

## Scope

The work in this pass focused on:

1. Race safety for queue reservation
2. Confirmation-aware fulfillment state
3. Requiring active heartbeat-backed donor wallets before reservation
4. Correct stop behavior in the donation wallet execution loop
5. Making `BTC available` reflect confirmed spendable donor balance instead of confirmed plus unconfirmed
6. Recovering stale broadcast transactions back into the queue

## Backend Changes

### 1. Atomic-style reservation behavior

Updated:
- [apps/backend/src/index.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/index.ts)

What changed:
- Replaced the old bulk `findAll -> update -> findAll` reservation pattern.
- Added conditional per-row reservation claims under the current reservation predicate.
- A row is only considered reserved if its update actually succeeds.

Impact:
- Removes the original double-reservation race where two donor wallets could believe they both reserved the same faucet requests.

### 2. Active-wallet requirement for reservation

Updated:
- [apps/backend/src/index.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/index.ts)
- [apps/backend/src/lib/donations.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/lib/donations.ts)

What changed:
- Added `isDonationWalletActive(address)` to the donation runtime.
- `POST /api/donations/reserve-requests` now rejects donor addresses that are not currently active in the heartbeat-backed wallet map.

Impact:
- Prevents unauthenticated clients from syntactically naming arbitrary donor addresses and hiding queue entries without proving current wallet control.

### 3. Confirmation-aware fulfillment

Updated:
- [apps/backend/src/database/models/FaucetRequest.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/database/models/FaucetRequest.ts)
- [apps/backend/src/index.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/index.ts)

What changed:
- Added support for the `broadcast` request status.
- After transaction broadcast, requests now move to `broadcast` instead of immediately becoming `paid`.
- Added backend reconciliation to periodically check broadcast transactions and mark requests `paid` only after confirmation.
- Updated queue-counting logic so queue totals include both `pending` and `broadcast` requests.
- Updated duplicate-request protection so a user cannot create another faucet request while a previous one is still pending or broadcast but unconfirmed.

Impact:
- Prevents requests from being permanently removed from the queue immediately on broadcast.
- Aligns backend state more closely with the real on-chain lifecycle.

### 4. Confirmed-only aggregate balance

Updated:
- [apps/backend/src/lib/donations.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/lib/donations.ts)

What changed:
- Active-wallet aggregate balance now uses confirmed spendable balance only.
- Per-wallet unconfirmed balances are still tracked separately.

Impact:
- The site-wide available balance is now closer to what donation wallets can actually spend.

### 5. Stale broadcast recovery

Updated:
- [apps/backend/src/config.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/config.ts)
- [apps/backend/config.json](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/config.json)
- [apps/backend/src/index.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/index.ts)

What changed:
- Added `donations.broadcastRecoveryMs` to backend config.
- Backend reconciliation now requeues `broadcast` requests if their fulfillment transaction is still unconfirmed after that timeout.
- Requeue clears the old fulfillment metadata so another donor wallet can reserve and pay the request again.

Impact:
- Prevents queue entries from remaining stuck forever after a dropped or never-confirmed broadcast.

## Frontend Changes

### 5. Stop behavior in the execution loop

Updated:
- [apps/frontend/client/scripts/pages/donate.js](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/frontend/client/scripts/pages/donate.js)

What changed:
- Added stop-state checks after awaited operations inside the donation execution cycle.
- The loop now aborts before signing or submission if the user clicks `Stop` mid-cycle.

Impact:
- Tightens the meaning of the stop control.
- Reduces the chance of a user seeing the wallet as stopped while it is still building or submitting a new payout.

## Verification

Commands run:

```powershell
node apps/frontend/scripts/build-donate-bundle.mjs
npm run build
```

Result:
- frontend donate bundle regenerated successfully
- monorepo build passed

## Current State

The originally audited issues have been addressed in code.

The next useful step is not another static patch pass; it is a real regtest end-to-end run to validate:
- reservation and fulfillment timing
- confirmation transitions
- stale-broadcast recovery
- donation wallet stop/start semantics in practice
