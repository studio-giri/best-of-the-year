# Publish a whole pass with one commit

**ID:** S-002-01
**Status:** Done

## Story

As the owner of a list, I want to type a game into any year of my list and publish every one of those changes with a single action, so that readers meet a list I finished thinking about rather than one I was still composing.

## Acceptance Criteria

- **Given** I am editing my list, **when** the list renders, **then** every year from 1985 to the current year is present as its own editable field — nothing to add or create first — and the years read newest-first.
- **Given** my list holds a game for some years and none for others, **when** the list renders, **then** the years holding no game appear as bands alongside the years that do, in the same visual band the published list uses for a year.
- **Given** an empty year, **when** I type a game into it, **then** nothing else on the list moves.
- **Given** a year's field, **when** it is reached by a screen reader, **then** it is announced as belonging to that specific year.
- **Given** a year, **when** I look at the editor, **then** it offers exactly one name for that year and no way to give it a second.
- **Given** I have typed into several years, **when** I have not yet committed, **then** a reader loading the public list sees the list exactly as it was before I started typing.
- **Given** changes across several years, **when** I take the one commit action, **then** all of them are published together — there is no per-year save and no save that happens on its own.
- **Given** a committed pass, **when** the public list is loaded afterwards, **then** it shows every change from that pass, and the same list is what the editor now shows as saved.
- **Given** a commit that succeeded, **when** it lands, **then** I am still in the editor with my list in front of me, free to keep going.
- **Given** a list where no year holds a game, **when** I look at the editor, **then** the commit action is not offered, and I am told a list needs at least one game.
- **Given** a list holding exactly one game, **when** I clear that year, **then** the commit action is not offered until some year holds a game again; **and when** I type a game into a different year instead, **then** committing is offered and publishes both changes together.
- **Given** a browser attempting to commit a list in which no year holds a game, **when** the commit is submitted, **then** it is refused and nothing is written.
- **Given** a browser that does not hold edit access for a list, **when** it attempts to commit changes to it, **then** the commit is refused and nothing is written.
- **Given** a commit naming a year the site does not cover, **when** it is submitted, **then** it is refused and nothing is written.

## Out of scope for this Story

How the editor reports the state of the pass (counts, in-progress, saved-when — S-002-02), what happens to a name's whitespace and control characters (S-002-05), and anything about a second browser committing at the same time (S-002-09). This slice is the write itself, end to end.

Withholding the commit action because *nothing has changed* belongs to S-002-02 (REQ-13); this slice withholds it only for a pass that would leave the list holding no games.

## Depends on

None — this is the root. The owner-only editor shell and its edit-access guard already exist from S-001-01.

## Satisfies

REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-8, REQ-9, REQ-10, REQ-11, REQ-17, REQ-18, REQ-21, REQ-29, REQ-30

## References

- PRD: [../../prd/002-list-contents.prd.md](../../prd/002-list-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-writes.md](../../adr/003-whole-list-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
