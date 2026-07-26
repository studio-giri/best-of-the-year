# Refuse a commit that would erase what another browser published

**ID:** S-002-09
**Status:** Needs refinement

## Story

As someone who edits from a laptop and a phone, I want a commit built on an out-of-date copy of my list to be refused rather than allowed to delete what the other browser already published, so that a list I assembled cannot be silently wiped by a stale one.

## Acceptance Criteria

- **Given** two browsers holding valid edit access to the same ranking, **when** both have the editor open, **then** both may edit at once — neither is locked out and neither's access is revoked.
- **Given** the editor loaded a copy of my list, **when** another browser publishes a game since then and I commit a pass that does not include it, **then** my commit is refused and nothing at all is written — the game published elsewhere is still there.
- **Given** such a refusal, **when** I look at the editor, **then** I am told my list changed somewhere else.
- **Given** such a refusal, **when** I look at the list, **then** every year I typed still holds exactly what I typed and is still reported as unsaved — the refusal costs me no work.
- **Given** the editor has committed successfully once, **when** I make a second pass and commit again with no other browser intervening, **then** it goes through — a commit is only refused because the list actually moved, never because it was committed from before.
- **Given** a refused commit, **when** the public list is loaded, **then** it shows what the other browser published, unchanged by my refusal.

## Out of scope for this Story

Recovering from that refusal on the person's behalf — S-002-11 — and keeping the two browsers in step while both editors are merely open — S-002-10. This slice is the refusal itself: never lose a published game.

## Depends on

S-002-01 — makes the commit that Story introduces refuse rather than clobber.

## Satisfies

REQ-34, REQ-35, REQ-36

## Open questions

- None.

## References

- PRD: [../../prd/002-ranking-contents.prd.md](../../prd/002-ranking-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-item-writes.md](../../adr/003-whole-list-item-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
