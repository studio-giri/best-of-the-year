# Know where the list and the pass stand at every moment of a commit

**ID:** S-002-02
**Status:** Needs refinement

## Story

As someone making a pass over my list, I want to see how much of it is filled, how much of it is unsaved, and what a commit is doing right now, so that I can tell at a glance whether my work is safe.

## Acceptance Criteria

- **Given** my ranking holds games for some of the covered years, **when** I look at the editor, **then** I can see how many of those years hold a game, out of how many years in total.
- **Given** I have changed three years since the list loaded, **when** I look at the editor before committing, **then** it tells me three years are unsaved.
- **Given** I change a year and then type it back to exactly what it was, **when** I look at the editor, **then** that year no longer counts as unsaved.
- **Given** nothing has changed since the list loaded, **when** I look at the editor, **then** committing is not offered.
- **Given** a commit I have just started, **when** it is still in flight, **then** I can see that a commit is in progress.
- **Given** a commit that succeeded, **when** it finishes, **then** I am told my changes are saved and when that happened.
- **Given** a commit in flight carrying year A, **when** I type into year B before it lands, **then** my text in year B is still exactly what I typed once the commit completes, and year B is reported as unsaved while year A is not.

## Out of scope for this Story

What a *refused* commit says (a stale copy — S-002-09; an over-long name — S-002-06; edit access gone — S-002-12). This slice reports the state of a pass that is progressing normally.

## Depends on

S-002-01 — reports on the commit that Story introduces.

## Satisfies

REQ-7, REQ-12, REQ-13, REQ-14, REQ-15, REQ-16

## Open questions

- REQ-15 asks that a person be told *when* their changes were saved: a clock time ("saved at 14:32") or a relative phrase ("saved just now")? A relative phrase needs to keep ticking to stay true; a clock time does not.

## References

- PRD: [../../prd/002-ranking-contents.prd.md](../../prd/002-ranking-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-item-writes.md](../../adr/003-whole-list-item-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
