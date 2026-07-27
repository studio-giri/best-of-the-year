# A commit refused only for a stale copy goes through without retrying

**ID:** S-002-11
**Status:** Needs refinement

## Story

As someone whose phone happened to publish a different year an hour ago, I want my commit to go through anyway, so that a refusal is something I almost never meet — and never for a year nobody else touched.

## Acceptance Criteria

- **Given** another browser has published a game for 1998 since my editor loaded, **when** I commit a pass that changes only 2011, **then** my change to 2011 is published without my doing anything a second time — I never press the button twice.
- **Given** that same situation, **when** the commit has settled, **then** the published list holds both the other browser's 1998 and my 2011, and my editor reports nothing unsaved.
- **Given** that same situation, **when** the commit has settled, **then** I was not told my list changed elsewhere — the refusal never surfaced, because no year of mine was in dispute.
- **Given** another browser has published a game for 2011 and I have also typed my own name into 2011, **when** I commit, **then** the refusal *does* surface as S-002-09 describes and my typing is kept — self-recovery covers only the years nobody else touched.
- **Given** a commit that recovers itself, **when** it is in flight, **then** the editor still shows a single commit in progress rather than flickering between refused and saved.
- **Given** a commit refused for any reason *other* than the list having moved, **when** it is refused, **then** it is not retried on my behalf.

## Out of scope for this Story

Showing a person both versions of a disputed year and letting them choose — deferred on `docs/ROADMAP.md`. When a year is genuinely in dispute, the typing session wins.

## Depends on

S-002-09 — recovers from the refusal that Story introduces.
S-002-10 — needs the merge rule that decides which years are actually in dispute.

## Satisfies

REQ-40

## Open questions

- How many times may a commit re-attempt on its own before the refusal is shown? A third browser can land between the refusal and the re-attempt. Options: once, then surface the refusal; or keep re-attempting while the disputed set stays empty.
- Is a self-recovering commit silent, as the acceptance criteria above assume? REQ-36 says a refused commit tells the person, REQ-40 says a disjoint refusal recovers without them; sliced on the reading that the message belongs only to a genuine dispute. Confirm.

## References

- PRD: [../../prd/002-list-contents.prd.md](../../prd/002-list-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-writes.md](../../adr/003-whole-list-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
