# Vulnerability Path Review

## High: OAuth callback/session binding weakness

- [`apps/backend/src/index.ts:1291`](apps/backend/src/index.ts:1291) to [`apps/backend/src/index.ts:1324`](apps/backend/src/index.ts:1324): `/api/faucet/request/start` accepts any submitted Bitcoin address, creates an `OAuthRequestState`, and stores that address before the user authenticates with X.
- [`apps/backend/src/database/models/OAuthRequestState.ts:16`](apps/backend/src/database/models/OAuthRequestState.ts:16) to [`apps/backend/src/database/models/OAuthRequestState.ts:18`](apps/backend/src/database/models/OAuthRequestState.ts:18): the persisted OAuth state binds the eventual request to `bitcoinAddress` and an optional `sessionSecretHash`.
- [`apps/backend/src/index.ts:1327`](apps/backend/src/index.ts:1327) to [`apps/backend/src/index.ts:1477`](apps/backend/src/index.ts:1477): `/api/x_oauth2_callback` looks up the state and reads the cookie, but at [`apps/backend/src/index.ts:1362`](apps/backend/src/index.ts:1362) to [`apps/backend/src/index.ts:1370`](apps/backend/src/index.ts:1370) it only logs a missing or mismatched session cookie and continues.
- [`apps/backend/src/index.ts:1435`](apps/backend/src/index.ts:1435) to [`apps/backend/src/index.ts:1447`](apps/backend/src/index.ts:1447): the faucet request is then created with `oauthState.bitcoinAddress`, so the callback completes against the address chosen during `start`, not the browser session that actually finished X authorization.

## High: Broadcast recovery can requeue still-valid payouts

- [`apps/backend/src/index.ts:326`](apps/backend/src/index.ts:326) to [`apps/backend/src/index.ts:409`](apps/backend/src/index.ts:409): `reconcileBroadcastRequests()` groups requests by `fulfillmentTxId` and treats every unconfirmed transaction older than `broadcastRecoveryMs` as recoverable.
- [`apps/backend/src/index.ts:354`](apps/backend/src/index.ts:354) to [`apps/backend/src/index.ts:380`](apps/backend/src/index.ts:380): if `getTransactionStatus(txid)` reports `confirmed === false`, the code clears `fulfillmentTxId`, `paidByAddress`, and reservation fields and moves the request back to `pending` without checking whether the transaction is still in the mempool or otherwise valid.
- [`apps/backend/src/index.ts:948`](apps/backend/src/index.ts:948) to [`apps/backend/src/index.ts:1097`](apps/backend/src/index.ts:1097): `/api/donations/submit-fulfillment` marks requests as `broadcast` after a successful submit, which is the state later re-opened by `reconcileBroadcastRequests()`.

## Medium: Signed but unfunded donation heartbeats can reserve requests

- [`apps/backend/src/lib/donations.ts:173`](apps/backend/src/lib/donations.ts:173) to [`apps/backend/src/lib/donations.ts:215`](apps/backend/src/lib/donations.ts:215): `verifyDonationHeartbeat()` only proves control of the private key for `address` and freshness of the challenge. It does not require any confirmed balance or spendable UTXOs before marking the wallet active.
- [`apps/backend/src/index.ts:584`](apps/backend/src/index.ts:584) to [`apps/backend/src/index.ts:633`](apps/backend/src/index.ts:633): `/api/donations/heartbeat` directly exposes that activation path.
- [`apps/backend/src/index.ts:911`](apps/backend/src/index.ts:911) to [`apps/backend/src/index.ts:946`](apps/backend/src/index.ts:946): `/api/donations/reserve-requests` only checks `isDonationWalletActive(donorAddress)` before reserving requests.
- [`apps/backend/src/index.ts:411`](apps/backend/src/index.ts:411) to [`apps/backend/src/index.ts:457`](apps/backend/src/index.ts:457): `reserveNextFaucetRequests()` locks and assigns pending requests to the caller, which hides them from other donors until the reservation expires even if the reserving wallet cannot fund a payout.
