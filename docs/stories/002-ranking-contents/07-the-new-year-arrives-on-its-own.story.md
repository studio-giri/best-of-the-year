# The list gains each new year as it begins, with nobody doing anything

**ID:** S-002-07
**Status:** Needs refinement

## Story

As someone who comes back to my list every January, I want the year that just ended to be waiting for me, so that nobody has to deploy, migrate, or configure anything for me to name its best game.

## Acceptance Criteria

- **Given** the calendar has moved into a new year, **when** I open the editor, **then that** year is present as its own field, with no action taken by anyone.
- **Given** the new year has begun, **when** I fill in that year and commit, **then** it is accepted and published like any other year.
- **Given** a new year begins while the site has been running untouched since the previous year, **when** I open the editor, **then** the new year is offered — the span is not frozen at whatever year the site started in.
- **Given** the calendar has moved into a new year, **when** I open the editor at most one week into it, **then** the new year is already fillable.
- **Given** any point in a year, **when** I open the editor, **then** the span still runs down to 1985 and has given up no year it offered before.
- **Given** the year *after* the current one, **when** a commit names it, **then** it is refused — growth reaches the year that has begun, not the one that has not.

## Out of scope for this Story

Precision finer than about a week (explicitly not required), and what happens to a year that fell *outside* the span — S-002-08.

## Depends on

S-002-01 — extends the span that Story establishes.

## Satisfies

REQ-31, REQ-32

## Open questions

- Whose clock decides the current year — the person's browser or the server? They disagree across time zones for up to a day, and ADR-003 already makes the server's ceiling deliberately one year looser than the editor's, which suggests the two are allowed to differ. Confirm that the editor may offer a year the person's own clock says has begun.

## References

- PRD: [../../prd/002-ranking-contents.prd.md](../../prd/002-ranking-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-item-writes.md](../../adr/003-whole-list-item-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
