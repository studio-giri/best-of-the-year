# Be told a used or expired link no longer works, while other valid links keep working

**ID:** S-001-05
**Status:** Needs refinement

## Story

As a person following a recovery link that has already been used or has aged out, I want to be told clearly it no longer works and how to get a fresh one, so that a stale link is a small detour rather than a dead end — and my other outstanding links still work.

## Acceptance Criteria

- **Given** a recovery link that has already been consumed once, **when** I open it again, **then** it does not grant access, I am told it no longer works, and I am directed to request a fresh one.
- **Given** a recovery link issued more than 48 hours ago, **when** I open it, **then** it does not grant access, I am told it has expired, and I am directed to request a fresh one.
- **Given** a recovery link issued less than 48 hours ago and never used, **when** I open it, **then** it still grants access (the expiry boundary is 48h from issuance).
- **Given** several recovery links were issued for the same ranking, **when** I request and obtain a new one, **then** the earlier unexpired links remain valid — requesting a new link does not invalidate the others.
- **Given** several valid links exist, **when** I consume one, **then** only that link is marked used; the others remain independently usable until they are each used or expire.

## Out of scope for this Story

Rate-limiting / abuse protection on recovery requests, and per-device bulk revocation — both explicitly deferred by the PRD.

## Depends on

S-001-04 — adds the used/expired/coexistence rules to the consume flow it establishes.

## Satisfies

REQ-18, REQ-19, REQ-20, REQ-21

## Open questions

- **Expiry boundary precision** — whether expiry is evaluated strictly at the 48h mark (inclusive/exclusive) and the time source used, so the boundary AC is deterministic in tests.
- **Used vs expired copy** — whether the "no longer works" message distinguishes used from expired, or shows one unified message.

## References

- PRD: [../../prd/001-ranking-ownership-without-sign-up.prd.md](../../prd/001-ranking-ownership-without-sign-up.prd.md) — the what & why
- ADR: [../../adr/001-accountless-owner-tokens.md](../../adr/001-accountless-owner-tokens.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
