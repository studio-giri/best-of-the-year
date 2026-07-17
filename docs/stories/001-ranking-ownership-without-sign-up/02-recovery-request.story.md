# Request recovery by email and get an honest, existence-aware response

**ID:** S-001-02
**Status:** Done

## Story

As a person who has lost edit access (new browser, cleared storage), I want to enter my email and be told honestly whether a ranking exists for it, so that I either get an emailed link back into mine or am told plainly to fix a mistyped address.

## Acceptance Criteria

- **Given** an email that fails the claim-time email validation — empty, malformed, or over 254 characters (same rules and copy as S-001-01) — **when** I submit the recovery form, **then** it is refused with that same message, I stay on the form, and no lookup runs.
- **Given** the recovery form, **when** I enter a well-formed email and submit, **then** the email is matched ignoring letter case and surrounding whitespace.
- **Given** an email that backs an existing ranking, **when** I submit, **then** a recovery link for that ranking is created, an email carrying that link is dispatched to the address, and I am told **"Check your inbox. We've emailed you a link to get back into your ranking."**
- **Given** an email that backs no ranking, **when** I submit, **then** it is refused with **"No ranking exists for this email."** shown inline, I stay on the form to correct the address, and no link is created or sent — a mistyped address is a correctable input error.
- **Given** an email that backs a ranking, **when** I request recovery twice, **then** two distinct valid links are created and neither dispatch reveals or alters the other.

## Out of scope for this Story

Clicking/consuming a link (S-001-04), and link expiry/single-use enforcement (S-001-05). This Story only issues links and responds honestly to the request.

This Story adds the functional unique index on `lower(trim(email))` (needed for the loose match). A known, accepted consequence: a duplicate-**email** claim then hits an index the claim handler does not yet translate, so it surfaces as a 500 until S-001-03 adds the clean duplicate-email refusal. S-001-03's scope is thereby reduced to that handling — the index already exists.

## Depends on

S-001-01 — provides the `email` column, existing rankings to match against, and the Owner-token minting seam (`owner_tokens`). This Story itself introduces the `recovery_tokens` table, the `lower(trim(email))` unique index, and the `Mailer` service.

## Satisfies

REQ-11, REQ-12, REQ-13, REQ-14

## References

- PRD: [../../prd/001-ranking-ownership-without-sign-up.prd.md](../../prd/001-ranking-ownership-without-sign-up.prd.md) — the what & why
- ADR: [../../adr/001-accountless-owner-tokens.md](../../adr/001-accountless-owner-tokens.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
