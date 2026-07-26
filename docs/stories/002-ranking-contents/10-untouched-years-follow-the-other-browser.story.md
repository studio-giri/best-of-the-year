# Untouched years follow the other browser; edited years keep mine

**ID:** S-002-10
**Status:** Needs refinement

## Story

As someone with the editor open on two browsers, I want years I have not touched to take on whatever the other browser published while years I am typing in keep my version, so that my copy stays current without my work ever being overwritten.

## Acceptance Criteria

- **Given** the editor is open and I have not edited year 2011, **when** another browser publishes a game for 2011 and my editor next brings itself up to date, **then** my form shows that game for 2011, and 2011 is not reported as unsaved.
- **Given** the editor is open and I have not edited year 2011, **when** another browser *empties* 2011 and my editor next brings itself up to date, **then** 2011 empties in my form too.
- **Given** I have typed my own name into year 2011, **when** another browser publishes a different game for 2011 and my editor brings itself up to date, **then** my form still shows mine, still reported as unsaved.
- **Given** I have typed my own name into year 2011 and the other browser published a different one, **when** I commit, **then** what is published for 2011 is mine.
- **Given** I have typed into year 2011 only, **when** another browser publishes a game for 1998 and my editor brings itself up to date, **then** 1998 shows the other browser's game, 2011 shows mine, and the unsaved count still names only 2011.
- **Given** my own commit has just succeeded, **when** the editor settles afterwards, **then** it shows the list as the server now holds it with nothing unsaved.

## Out of scope for this Story

Keystroke-by-keystroke collaboration — explicitly out of scope in the PRD. Two browsers come into step at commit boundaries and on the editor re-taking focus, not continuously. Also out of scope: the refusal itself (S-002-09) and its self-recovery (S-002-11).

## Depends on

S-002-01 — needs a saved list and a pass measured against it to merge into.

## Satisfies

REQ-37, REQ-38, REQ-39

## Open questions

- What exactly triggers "bringing itself up to date"? The PRD fixes the *boundaries* — commit boundaries and refocus — but not the event: window focus, tab visibility becoming visible, or both. They differ for a person switching browser tabs versus switching applications.
- Does a year that changes underneath the person announce itself, or does it simply update? Silently updating is consistent with "quietly stay in step", but a field changing while the page sits open with no explanation is startling.

## References

- PRD: [../../prd/002-ranking-contents.prd.md](../../prd/002-ranking-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-item-writes.md](../../adr/003-whole-list-item-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
