# Click a valid recovery link and land in edit mode on a new browser

**ID:** S-001-04
**Status:** Needs refinement

## Story

As a person who received a recovery link, I want clicking it to put me straight into editing on whatever browser I open it in, so that I regain access without re-authenticating or losing access on my other browsers.

## Acceptance Criteria

- **Given** a valid, unused, unexpired recovery link, **when** I open it in a new browser, **then** a fresh owner token for the requester's own ranking is issued to that browser and stored locally, and I land directly in the owner-only editor state — with no extra confirmation step.
- **Given** I land via the link, **when** the ranking page loads, **then** the edit-access check returns authorized for that ranking in this browser (the same seam established in S-001-01).
- **Given** another browser already held a valid owner token for the same ranking, **when** I recover on the new browser, **then** the previously authorized browser still authorizes — recovery is additive and revokes nothing, so the ranking is editable from both at once.
- **Given** a recovery link, **when** it is consumed, **then** it only ever restores access to the requester's own ranking and never to anyone else's.
- **Given** the consume flow, **when** I complete it, **then** I was not asked for a password, an account, or any email confirmation, and the response never exposes the email.

## Out of scope for this Story

What happens when a link is *used again* or has *expired* — that is S-001-05. This Story covers the valid-link happy path and its additive, own-ranking-only guarantees.

## Depends on

S-001-01 — reuses the owner-token issuance, browser storage, and edit-access authorization seam.
S-001-02 — consumes the recovery links that flow issues.

## Satisfies

REQ-15, REQ-16, REQ-17, REQ-24, REQ-25, REQ-26

## Open questions

- **Recovery link route shape** — the frontend route that receives the token and the request shape that exchanges it for an owner token (resolved together with S-001-02).

## References

- PRD: [../../prd/001-ranking-ownership-without-sign-up.prd.md](../../prd/001-ranking-ownership-without-sign-up.prd.md) — the what & why
- ADR: [../../adr/001-accountless-owner-tokens.md](../../adr/001-accountless-owner-tokens.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
