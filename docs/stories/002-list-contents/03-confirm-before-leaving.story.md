# Confirm before leaving with an uncommitted pass

**ID:** S-002-03
**Status:** Needs refinement

## Story

As someone in the middle of a pass, I want to be asked before I walk away from work I have not committed, so that a stray click does not quietly throw away a list I spent time on.

## Acceptance Criteria

- **Given** at least one year is unsaved, **when** I follow a link that leaves the editor, **then** I am asked to confirm before the editor goes, and cancelling leaves me exactly where I was with every unsaved year intact.
- **Given** at least one year is unsaved, **when** I confirm that I want to leave, **then** the navigation proceeds.
- **Given** at least one year is unsaved, **when** I try to close or reload the tab, **then** the browser asks me to confirm first.
- **Given** nothing is unsaved — an untouched visit, or a pass I have just committed — **when** I leave the editor, **then** I am not asked anything.

## Out of scope for this Story

Getting the pass *back* after leaving anyway — that is S-002-04. This slice only asks the question.

## Depends on

S-002-01 — the notion of an uncommitted pass exists only once committing does.

## Satisfies

REQ-19

## Open questions

- None.

## References

- PRD: [../../prd/002-list-contents.prd.md](../../prd/002-list-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-writes.md](../../adr/003-whole-list-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
