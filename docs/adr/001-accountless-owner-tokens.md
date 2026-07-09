# Account-less edit access via client-side bearer Owner tokens

Realizes [PRD 001 — Ranking ownership without sign-up](../prd/001-ranking-ownership-without-sign-up.prd.md), which owns all user-facing behavior and scope. This ADR records only *how* that behavior is implemented.

## Decision

Edit access to a Ranking is carried by a **client-side bearer Owner token**: an opaque random secret held in the editor's browser, of which the server keeps only a hash. Presenting a token whose hash matches authorizes the edit — there is no server-side session, account, or password store.

- **Tokens live in their own table**, many-to-one against `rankings`, so a Ranking can hold several concurrent tokens (one per browser) and a future bulk-revocation can delete them as a set.
- **Edit access is derived client-side** — a browser has edit access to a Ranking iff it holds a stored token for that Ranking's id, and the UI uses that to decide whether to offer the owner view. The server is the real authority: there is no pre-check endpoint, and it re-validates the token only on the actual edit write.
- **Token transport** — the token lives in `localStorage` and rides on an `Authorization: Bearer` header. Chosen over an `httpOnly` cookie because frontend and backend are cross-origin: a cookie would need `SameSite=None; Secure` with credentialed CORS and an exact-origin allowlist that breaks whenever the API host moves, whereas the bearer header fits the existing typed client seam. The cookie's one real advantage — hiding the token from JS — buys little here, since the PRD's low-stakes framing already accepts the token's XSS exposure.
- **Recovery** is a single-use, 48h Owner link, kept in its own `recovery_tokens` table separate from `owner_tokens` because the two credentials have different lifecycles: an Owner token is long-lived and never consumed, an Owner link expires and is single-use. Consuming a link issues a fresh Owner token for the requesting browser.
- **Email delivery** goes through a `Mailer` Effect `Layer`, so handlers depend on an interface rather than a concrete provider and the send is a mockable seam. A logging layer is the default; a real-provider layer is deferred (see ROADMAP).

## Considered options

- **Password / OAuth accounts** — rejected: the PRD forbids any sign-up friction.
- **Magic link as the sole gate (no client-held credential)** — rejected: it would force an inbox round-trip mid-creation and on every return, contradicting the PRD's seamless durable-per-browser editing.
- **A durable, rotatable capability URL** — rejected: it leaves a long-lived secret sitting in URLs, browser history, and server logs. Single-use links that bootstrap a per-browser token avoid the standing secret.

## Consequences

- With no server session, there is no central place to invalidate access today; per-device revocation ("reset all tokens for this email") is a future addition the table layout already allows.
- Storing only hashes means a database read cannot recover a usable token — but a lost token is then unrecoverable except by issuing a new one via recovery.
- Per the PRD's low-stakes framing, the bearer model's weaknesses (a token is edit access to whoever holds it; a `localStorage` token is exposed to XSS) are accepted rather than mitigated.
