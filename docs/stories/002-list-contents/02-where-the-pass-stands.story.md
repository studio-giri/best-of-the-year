# Know where the list and the pass stand at every moment of a commit

**ID:** S-002-02
**Status:** Done

## Story

As someone making a pass over my list, I want to see how much of it is unsaved and what a commit is doing right now, so that I can tell at a glance whether my work is safe.

The editor carries one report of where the pass stands, in at most two clauses: when this visit last committed, and what the pass is doing now. The English wording is fixed by the criteria below because it is what a person reads; the same lines exist in French, as ADR-002 requires of every surface.

## Acceptance Criteria

- **Given** I have changed three entries since the list loaded, **when** I look at the editor before committing, **then** the report reads `3 entries unsaved` — and `1 entry unsaved`, not a plural, when only one has changed.
- **Given** I change an entry and then type it back to exactly what it was, **when** I look at the report, **then** it no longer counts as unsaved.
- **Given** a year holding no game, **when** I type only spaces into it, **then** nothing is reported as unsaved — a year of spaces is no different from a year left blank.
- **Given** nothing has changed since the list loaded, **when** I look at the editor, **then** committing is not offered and the report reads `No changes to save`.
- **Given** a list I committed to on an earlier visit, **when** I open the editor, **then** the report reads `No changes to save` with no time in it — a commit I did not take in this visit is not one it reports.
- **Given** a pass that would leave my list holding no entries at all, **when** I look at the report, **then** it reads `A list needs at least one entry` in place of the unsaved count.
- **Given** a commit still in flight, **when** I look at the editor, **then** the control I took shows it is working and cannot be taken a second time — only ever one request in the air — while the report beside it still names the entries that are not yet saved.
- **Given** a commit that succeeded, **when** it finishes, **then** I am told when it landed as a fixed clock time — `Last saved at 14:32:09` — which stays true however long I sit on the page rather than needing to keep ticking.
- **Given** two commits in the same visit, **when** the second lands, **then** the time reported is the second commit's, not the first's.
- **Given** a commit that landed and typing I have done since, **when** I look at the report, **then** it carries both facts at once: `Last saved at 14:32:09 - 3 entries unsaved`.
- **Given** a commit in flight carrying year A, **when** I type into year B before it lands, **then** my text in B is still exactly what I typed once the commit completes and B is reported as unsaved, A is not, and a year I left alone throughout takes the answer's version — a name the server tidied included.
- **Given** a commit in flight carrying year A, **when** I keep typing into year A itself before it lands, **then** what I typed is still in the field once the commit completes — never rewritten under me by the answer — and year A is reported as unsaved again.
- **Given** I am using a screen reader, **when** a commit succeeds, **then** the confirmation is announced to me without my going looking for it — as a refusal already is — while entries crossing to unsaved as I type are left to be read rather than announced at me.

## Out of scope for this Story

What a *refused* commit says (a stale copy — S-002-09; an over-long name — S-002-06; edit access gone — S-002-12). This slice reports the state of a pass that is progressing normally.

## Depends on

S-002-01 — reports on the commit that Story introduces.

## Satisfies

REQ-12, REQ-13, REQ-14, REQ-15, REQ-16

## References

- PRD: [../../prd/002-list-contents.prd.md](../../prd/002-list-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-writes.md](../../adr/003-whole-list-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
