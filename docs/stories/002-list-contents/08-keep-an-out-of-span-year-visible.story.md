# Keep a game held outside Covered Years visible rather than dropping it

**ID:** S-002-08
**Status:** Needs refinement

## Story

As the owner of a list that somehow holds a game for a year the site no longer offers, I want to see that year in the editor, so that committing a pass never deletes something I was never shown.

## Acceptance Criteria

- **Given** my list holds a game for a year outside 1985 through the current year, **when** I open the editor, **then** that year appears as a band with its game in it, like any other year.
- **Given** that out-of-span year is shown, **when** I change its name and commit, **then** the change is published.
- **Given** that out-of-span year is shown, **when** I clear it and commit, **then** its game is removed from the list.
- **Given** that out-of-span year is shown and I leave it alone, **when** I commit a pass that changed other years, **then** the out-of-span game is still there afterwards — untouched, not dropped.
- **Given** an out-of-span year that holds *no* game, **when** I open the editor, **then** it is not offered — only a year that actually holds something earns a band outside the span.

## Out of scope for this Story

Letting a person *create* a game in a year outside the span — that stays refused (S-002-01). This slice only keeps an existing one reachable.

## Depends on

S-002-01 — relies on that Story's commit and on the span it enforces.

## Satisfies

REQ-33

## Open questions

- Is an out-of-span year marked as unusual in any way, or is it indistinguishable from a covered year?

## References

- PRD: [../../prd/002-list-contents.prd.md](../../prd/002-list-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-writes.md](../../adr/003-whole-list-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
