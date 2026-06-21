# Be refused a duplicate email at claim time, with a clear path into recovery

**ID:** S-001-03

## Story

As a person trying to claim a ranking with an email that already has one, I want to be told plainly that a second isn't possible and shown how to get back into mine, so that the one-per-email rule doesn't strand me.

## Acceptance Criteria

- **Given** an email that already backs a ranking (matched ignoring case and surrounding whitespace), **when** I submit a claim, **then** the claim is refused *before* a second ranking is created, with an explanation that one email backs at most one ranking.
- **Given** that refusal, **when** it is shown, **then** it offers a clear path into recovery (a link to the recovery-request flow), not a dead end.
- **Given** the duplicate-email refusal, **when** I compare it to the duplicate-username refusal, **then** only the email case routes toward recovery — the username case (S-001-01) stays an inline "choose another" with no recovery path.
- **Given** the refusal response, **when** it is returned, **then** it never includes the email of the existing ranking beyond what the submitter already typed.

## Out of scope for this Story

The recovery-request flow itself (S-001-02 builds it); this Story only refuses and links to it.

## Depends on

S-001-01 — extends the claim flow with email-uniqueness enforcement.
S-001-02 — the "path back" links to the recovery-request page, which must exist to not be a dead end.

## Satisfies

REQ-6, REQ-7

## Open questions

- **Refusal copy** — exact wording of the "this email already has a ranking" explanation and the recovery call-to-action.

## References

- PRD: [../../prd/001-ranking-ownership-without-sign-up.prd.md](../../prd/001-ranking-ownership-without-sign-up.prd.md) — the what & why
- ADR: [../../adr/001-accountless-edit-tokens.md](../../adr/001-accountless-edit-tokens.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
