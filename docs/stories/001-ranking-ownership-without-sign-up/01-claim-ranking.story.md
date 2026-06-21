# Claim a ranking with email + username and immediately own it for editing on this browser

**ID:** S-001-01

## Story

As a person building a ranking of my own, I want to claim it with just my email and a username, so that I own it and can keep editing it from this browser without ever creating an account.

## Acceptance Criteria

- **Given** the creation page, **when** it loads, **then** no identity or contact detail has been required to reach or start it, and the email field is shown and marked required from the start (not introduced only at save).
- **Given** a fresh email and an unused username, **when** I submit the claim, **then** a ranking is created under that username and a bearer edit token is issued to this browser and stored locally.
- **Given** I have just claimed, **when** I load the ranking's page (`/game/:id`) in this same browser, **then** I see an owner-only editor state (an "Edit" / "this is yours" affordance) that an anonymous visitor does not see — with no email round-trip in between.
- **Given** this browser holds a token for a *different* ranking (or holds no token), **when** it loads `/game/:id`, **then** it is treated as not authorized to edit — no owner-only editor state, and any edit-authorized action is refused.
- **Given** I revisit the ranking's page later in the same browser, **when** it loads, **then** I am still in the owner-only editor state with no re-authentication (durable per browser).
- **Given** a syntactically invalid email (e.g. `foo@`), **when** I submit, **then** the claim is refused with a format error and I stay on the form; no verification or confirmation step occurs.
- **Given** a username already in use (ignoring case and surrounding whitespace), **when** I submit, **then** the claim is refused and I am asked to choose a different username — I am **not** routed into recovery.
- **Given** I submit, **when** the claim succeeds, **then** the response and the public `GET /rankings/:id` contain the username but never the email; an anonymous browser (no token) can read the ranking and see the username.
- **Given** the entire claim flow, **when** I complete it, **then** at no point was I asked to set a password, create an account, or confirm my email.

## Out of scope for this Story

The contents of the ranking (adding/editing/reordering games) and any duplicate-**email** handling — duplicate email is S-001-03.

## Depends on

None — this is the root. It introduces the `email` column, the edit-tokens table, the first `POST` claim endpoint, browser token storage, and the edit-access authorization seam that later Stories reuse.

## Satisfies

REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-8, REQ-9, REQ-10, REQ-22, REQ-23, REQ-24, REQ-25, REQ-26

## Open questions

- **Token transport** — `localStorage` + `Authorization` header vs an `httpOnly` cookie. The ADR defers this and leans bearer-header given the cross-origin `VITE_API_URL` + CORS split; confirm before building.
- **Edit-access surface** — exact shape of the authorization check (a dedicated `GET /rankings/:id/edit-access`, or grant state returned by the claim/read responses) and the exact owner-only affordance rendered.
- **Field limits & copy** — username max length (schema today is `varchar(30)`), email max length, and the wording of the invalid-email and duplicate-username errors.

## References

- PRD: [../../prd/001-ranking-ownership-without-sign-up.prd.md](../../prd/001-ranking-ownership-without-sign-up.prd.md) — the what & why
- ADR: [../../adr/001-accountless-edit-tokens.md](../../adr/001-accountless-edit-tokens.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
