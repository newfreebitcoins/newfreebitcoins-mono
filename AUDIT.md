# Code Audit

Date: 2026-04-05

Scope:
- donation wallet execution flow
- queue reservation and fulfillment flow
- heartbeat / active-wallet accounting
- regtest readiness review

## Findings

Status key:
- Fixed
- Remaining

### 1. Reservation is not atomic

Status: Fixed

Severity: High

Files:
- [apps/backend/src/index.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/index.ts#L491)

Problem:
- `POST /api/donations/reserve-requests` currently does `findAll -> update -> findAll`.
- There is no row lock and no conditional update that re-checks reservation state.
- Two donor wallets can read the same pending requests before either update lands.
- Both wallets can believe they reserved the same requests.

Why it matters:
- This breaks the core guarantee that only one donation wallet can fulfill a faucet request at a time.

Resolution:
- Reservation now uses conditional per-row claims instead of a blind bulk update.
- A donor wallet only keeps rows whose update actually succeeded under the current reservation predicate.

### 2. Requests are marked paid before confirmation

Status: Fixed

Severity: High

Files:
- [apps/backend/src/index.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/index.ts#L661)

Problem:
- After broadcast succeeds, the backend immediately marks the reserved requests as `paid`.
- The wallet UI waits for confirmation before moving on, but the backend queue state does not.

Why it matters:
- If the transaction is dropped, replaced, or never confirms, those faucet requests are already removed from the queue.
- That creates silent loss and bad accounting.

Resolution:
- Added the intermediate `broadcast` state.
- Backend reconciliation now periodically checks broadcast transactions and only marks them `paid` after confirmation.

### 3. Reservation endpoint does not require proof of active wallet control

Status: Fixed

Severity: High

Files:
- [apps/backend/src/index.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/index.ts#L491)

Problem:
- `POST /api/donations/reserve-requests` only checks that `donorAddress` is syntactically valid.
- It does not require the wallet to be active in the heartbeat map.
- It does not require recent proof of control of the donor address.

Why it matters:
- A client can repeatedly reserve the oldest requests using any valid address and hide the queue for one-minute windows.
- This is effectively a reservation DoS against payout execution.

Resolution:
- Reservation now rejects donor addresses that are not currently active in the heartbeat-backed wallet map.

### 4. Stop does not stop an in-flight donation cycle

Status: Fixed

Severity: Medium

Files:
- [apps/frontend/client/scripts/pages/donate.js](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/frontend/client/scripts/pages/donate.js#L760)
- [apps/frontend/client/scripts/pages/donate.js](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/frontend/client/scripts/pages/donate.js#L880)

Problem:
- Clicking `Stop` only disables future scheduled cycles.
- If the loop is already in progress and is awaiting reserve/build/submit work, it continues.
- A transaction can still be created and broadcast after the user has clicked stop.

Why it matters:
- The UI promise to the donor is weaker than it appears.
- The user can believe the wallet is stopped while it is still actively processing a payout.

Resolution:
- The donation execution loop now re-checks the enabled state after awaited steps and aborts before signing or submission if the wallet has been stopped.

### 5. Available balance can overstate spendable balance

Status: Fixed

Severity: Medium

Files:
- [apps/backend/src/lib/donations.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/lib/donations.ts#L90)
- [apps/frontend/client/scripts/pages/donate.js](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/frontend/client/scripts/pages/donate.js#L659)

Problem:
- The backend counts `confirmed + unconfirmed` for active donation wallets.
- The frontend fulfillment flow only spends confirmed UTXOs.

Why it matters:
- The site can show funds as available even though the wallet cannot currently fulfill requests with them.
- On regtest this will likely show up as confusing “available balance exists but no spendable funds” behavior.

Resolution:
- Active-wallet accounting now uses confirmed balance for the aggregate available total.
- Per-wallet unconfirmed values remain available separately for UI use.

### 6. Broadcast requests can remain stuck indefinitely if the transaction never confirms

Status: Fixed

Files:
- [apps/backend/src/index.ts](/C:/Users/jorge_gleqj9t/Desktop/Projects/NewFreeBitcoins/apps/backend/src/index.ts)

Problem:
- Requests now move to `broadcast` and wait for backend reconciliation to mark them `paid`.
- Without a recovery rule, a dropped or never-confirmed transaction could leave requests stuck indefinitely.

Why it matters:
- In that scenario, requests would remain stuck in `broadcast` instead of returning to the queue.

Resolution:
- Added configurable stale-broadcast recovery.
- Unconfirmed `broadcast` requests are requeued automatically after `donations.broadcastRecoveryMs`.
- Recovery clears the old fulfillment metadata so another donor wallet can pick the request up again.

## Summary

Current status:
- `npm run build` passes.
- The original six audited issues have been addressed.

Highest priority fixes before regtest E2E:
1. Run a real regtest E2E against the current Electrum and explorer setup.
