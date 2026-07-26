# A game's name is stored as the visible text that was typed

**ID:** S-002-05
**Status:** Needs refinement

## Story

As someone typing game titles, I want stray whitespace and invisible characters forgiven rather than published, so that a padded paste or an emptied field does exactly what it looks like it does.

## Acceptance Criteria

- **Given** a year where I type `"  Elden Ring\n"`, **when** I commit, **then** the published name is `Elden Ring`, and the field shows that tidied form once the commit has landed.
- **Given** a year where I type only spaces or tabs, **when** I commit, **then** that year holds no game — exactly as if I had left it blank — and it is not published as an empty name.
- **Given** a year that held a game, **when** I clear its field and commit, **then** the game is gone from the ranking and the public list no longer shows a name for that year.
- **Given** a name into which invisible control characters have been pasted, **when** I commit, **then** they are discarded: neither stored nor published, while the visible text survives.
- **Given** a name in any language or script — accents, non-Latin characters, punctuation, emoji — **when** I commit, **then** it is accepted and published exactly as typed, character for character.
- **Given** a request that reaches the server with an untidied name, **when** it is handled, **then** the server tidies it the same way rather than trusting the sender to have done it.

## Out of scope for this Story

The 255-character ceiling and the refusal it triggers — that is S-002-06. This slice is only about what a name is *silently* reduced to.

## Depends on

S-002-01 — tidying applies to the commit that Story introduces.

## Satisfies

REQ-22, REQ-23, REQ-24, REQ-25, REQ-28

## Open questions

- "Invisible control characters" (REQ-25) needs a decided set. C0 controls are the ADR's stated target, but zero-width joiners and bidirectional overrides are also invisible and are load-bearing in some scripts — stripping those would break names REQ-28 promises to accept.
- Does the field show its tidied form only after a commit lands (REQ-22's wording), or also when it loses focus? Tidying on blur is friendlier but makes it harder to tell a tidy from an edit.

## References

- PRD: [../../prd/002-ranking-contents.prd.md](../../prd/002-ranking-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-item-writes.md](../../adr/003-whole-list-item-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
