# Account-less edit access via client-side bearer Edit tokens

Realizes [PRD 001 — Ranking ownership without sign-up](../prd/001-ranking-ownership-without-sign-up.prd.md),
which owns all the user-facing behavior and scope. This ADR records only *how*
that behavior is implemented; it defines no product behavior itself.

## Decision

Edit access to a Ranking is carried by a **client-side bearer Edit token**: an
opaque random secret stored in the editor's browser, of which the server keeps
only a hash. Presenting a token whose hash matches authorizes the edit — there
is no server-side session, account, or password store.

- **Recovery** is a single-use, 48h-expiry **Edit link**, implemented as a
  hashed token row with an expiry timestamp. Consuming the link issues a fresh
  Edit token row for the requesting browser, then marks the recovery token spent.
- **Tokens live in their own table**, many-to-one against `rankings`, so a
  Ranking can have several concurrent tokens (one per browser) and a future
  bulk-revocation can delete them as a set.
- **One-per-email** (a PRD constraint) is enforced with a unique constraint on
  the Ranking's email column; `username` (public name) and `email` (private) are
  distinct columns. `username` additionally carries its own unique constraint, so
  no two Rankings share a public name; collision handling at claim time is left
  to the implementation phase.
- **Token transport** — `localStorage` + `Authorization` header vs an
  `httpOnly` cookie — is deferred to the implementation phase. The current
  cross-origin frontend/backend split (`VITE_API_URL` + CORS) leans toward a
  bearer header, but this is not yet committed.

## Considered options

- **Password / OAuth accounts** — rejected: the PRD forbids any sign-up friction.
- **Magic link as the sole gate (no client-held credential)** — rejected: it
  would force an inbox round-trip mid-creation and on every return, contradicting
  the PRD's seamless durable-per-browser editing.
- **A durable, rotatable capability URL** — rejected on technical grounds: it
  leaves a long-lived secret sitting in URLs, browser history, and server logs.
  Single-use links that bootstrap a per-browser token avoid the standing secret.

## Consequences

- Because the credential is a bearer token with no server session, there is no
  central place to invalidate access today; per-device revocation ("reset all
  tokens for this email") is a future addition the table layout already allows.
- Storing only token hashes means a database read cannot recover a usable token,
  but also means a lost token is unrecoverable except by issuing a new one via
  the recovery flow.
- Given the PRD's low-stakes framing, the bearer model's weaknesses (a token is
  edit access to whoever holds it; a token in `localStorage` is exposed to XSS)
  are accepted rather than mitigated.
