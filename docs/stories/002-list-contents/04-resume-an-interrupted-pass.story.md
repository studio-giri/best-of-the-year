# Resume an interrupted pass instead of retyping it

**ID:** S-002-04
**Status:** Needs refinement

## Story

As someone whose pass was interrupted — a reload, the back button, a mis-click — I want to find my uncommitted typing still there when I return to the editor, so that an accident costs me nothing.

## Acceptance Criteria

- **Given** several years typed and not committed, **when** I reload the editor, **then** every one of those years still holds what I typed, and they are still reported as unsaved.
- **Given** several years typed and not committed, **when** I leave the editor by a route that cannot be intercepted — the back button — and then return to it, **then** my typing is still there.
- **Given** a year I emptied but have not committed, **when** I return to the editor, **then** that year is still empty rather than showing the game it holds on the server.
- **Given** a pass I resumed, **when** I commit it, **then** what gets published is what I resumed and continued — the recovered typing is real work, not a display.
- **Given** I have committed my pass, **when** I return to the editor later, **then** I see the saved list with nothing unsaved — a committed pass leaves nothing to recover.
- **Given** I open the editor without changing anything, **when** I leave and come back, **then** nothing is reported as unsaved.
- **Given** the editor for one list, **when** it resumes a pass, **then** it never shows typing left behind for a different list.

## Out of scope for this Story

Being *asked* before leaving — that is S-002-03. This slice is about what survives when the leaving happens anyway.

## Depends on

S-002-01 — there is nothing to resume until a pass is a batch awaiting a commit.

## Satisfies

REQ-20

## Open questions

- Does a resumed pass announce itself ("we kept your unsaved changes") or simply appear? Silently appearing is the cheaper answer and matches the unsaved-year count already being on screen, but it leaves a person briefly unable to tell a recovered pass from the saved list.

## References

- PRD: [../../prd/002-list-contents.prd.md](../../prd/002-list-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-writes.md](../../adr/003-whole-list-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
