# Claim a ranking with email + username and immediately own it for editing on this browser

**ID:** S-001-01
**Status:** Ready

## Story

As a person building a ranking of my own, I want to claim it with just my email and a username, so that I own it and can keep editing it from this browser without ever creating an account.

## Acceptance Criteria

- **Given** a visitor who has not identified themselves, **when** they begin building a ranking, **then** nothing about their identity or contact details is required to start.
- **Given** the creation flow, **when** it is shown, **then** the email field is presented and marked required from the start — not introduced only at save.
- **Given** a valid email and an unused username, **when** I submit the claim, **then** a ranking is created showing that username and the claiming browser is taken straight to the ranking's editable owner view, with no email round-trip before I can continue.
- **Given** I claimed on this browser, **when** I return to the ranking on a later visit in the same browser, **then** I can still open its editable owner view with no re-authentication.
- **Given** a browser that has not claimed or recovered this ranking, **when** it opens the ranking, **then** it gets the public read-only view only; attempting to open the editable owner view is refused — the browser is sent to the public view instead.
- **Given** a syntactically invalid email (e.g. `foo@`), or one longer than 254 characters, **when** I submit, **then** the claim is refused with **"Email is invalid."** and I stay on the form; no verification or confirmation step occurs.
- **Given** a blank or whitespace-only email, **when** I submit, **then** the claim is refused with **"Email cannot be empty."** and I stay on the form.
- **Given** a username already in use (ignoring letter case and surrounding whitespace), **when** I submit, **then** the claim is refused with **"Username taken: pick another."**, I stay on the form, and I am **not** routed into recovery.
- **Given** a blank or whitespace-only username, **when** I submit, **then** the claim is refused with **"Username cannot be empty."** and I stay on the form.
- **Given** a username that, after surrounding whitespace is trimmed, is shorter than 2 or longer than 30 characters, **when** I submit, **then** the claim is refused with **"Username must be at least 2 characters."** or **"Username must be 30 characters or fewer."** respectively, and I stay on the form.
- **Given** a username with surrounding whitespace and any casing, **when** the claim succeeds, **then** the username is stored and shown trimmed and in the casing I chose (e.g. `"  Paulin "` is shown as `"Paulin"`).
- **Given** a claimed ranking, **when** anyone views it — including someone with no edit access — **then** they see the ranking and its username, but the email is never shown.
- **Given** the entire claim flow, **when** I complete it, **then** at no point was I asked to set a password, create an account, or confirm my email.

## Out of scope for this Story

The contents of the ranking (adding/editing/reordering games) and any duplicate-**email** handling — duplicate email is S-001-03.

## Depends on

None — this is the root. It introduces the `email` column, the edit-tokens table, the first `POST` claim endpoint, browser token storage, and the edit-access authorization seam that later Stories reuse.

## Satisfies

REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-8, REQ-9, REQ-10, REQ-22, REQ-23, REQ-24, REQ-25, REQ-26

## References

- PRD: [../../prd/001-ranking-ownership-without-sign-up.prd.md](../../prd/001-ranking-ownership-without-sign-up.prd.md) — the what & why
- ADR: [../../adr/001-accountless-edit-tokens.md](../../adr/001-accountless-edit-tokens.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
