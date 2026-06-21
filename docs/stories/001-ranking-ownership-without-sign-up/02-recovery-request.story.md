# Request recovery by email and get an honest, existence-aware response

**ID:** S-001-02
**Status:** Needs refinement

## Story

As a person who has lost edit access (new browser, cleared storage), I want to enter my email and be told honestly whether a ranking exists for it, so that I either get an emailed link back into mine or am invited to create one.

## Acceptance Criteria

- **Given** the recovery form, **when** I enter an email and submit, **then** the email is matched ignoring letter case and surrounding whitespace.
- **Given** an email that backs an existing ranking, **when** I submit, **then** a single-use recovery link (a hashed token row with an expiry) is created for that ranking, an email carrying that link is dispatched to the address, and I am told to check my inbox.
- **Given** an email that backs no ranking, **when** I submit, **then** I am told plainly that no ranking exists for it and offered a path to create one — not a dead end, and not a vague "if it exists, a link was sent" message.
- **Given** either outcome, **when** the response is shown, **then** it signals existence honestly (the two outcomes are distinguishable) and never reveals the email of any ranking.
- **Given** an email that backs a ranking, **when** I request recovery twice, **then** two distinct valid links are created and neither dispatch reveals or alters the other.

## Out of scope for this Story

Clicking/consuming a link (S-001-04), and link expiry/single-use enforcement (S-001-05). This Story only issues links and responds honestly to the request.

## Depends on

S-001-01 — needs the `email` column and existing rankings to check against, and introduces the recovery-link (Edit-link) token table.

## Satisfies

REQ-11, REQ-12, REQ-13, REQ-14

## Open questions

- **Email dispatch mechanism** — real provider vs a logged/mocked sender in dev/test; the AC asserts a dispatch was invoked with the link to the address, so the seam must be observable/mockable.
- **Token storage shape** — whether recovery links and edit tokens share one typed table or live in two (the ADR describes both as hashed rows; either satisfies the mechanism).
- **Recovery link URL/route shape** — the path the emailed link points at (resolved together with S-001-04).

## References

- PRD: [../../prd/001-ranking-ownership-without-sign-up.prd.md](../../prd/001-ranking-ownership-without-sign-up.prd.md) — the what & why
- ADR: [../../adr/001-accountless-edit-tokens.md](../../adr/001-accountless-edit-tokens.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
