# Refuse an over-long name, naming the year at fault

**ID:** S-002-06
**Status:** Needs refinement

## Story

As someone who pasted something absurd into a year, I want to be told plainly which year is at fault instead of having my title quietly shortened, so that nothing is published in my name that I did not write.

## Acceptance Criteria

- **Given** a year whose name is longer than 255 visible characters, **when** I attempt to commit, **then** the commit does not go through and I am told which year is at fault.
- **Given** that refusal, **when** I look at the list, **then** no name has been shortened — the over-long text is still there in full, exactly as I left it, and every other year I changed is still unsaved rather than published.
- **Given** I shorten the offending year to within the limit, **when** I commit again, **then** the whole pass goes through.
- **Given** a name of exactly 255 visible characters, **when** I commit, **then** it is accepted.
- **Given** a name whose visible text is within the limit only after its surrounding whitespace is forgiven, **when** I commit, **then** it is accepted — the ceiling applies to the tidied name.
- **Given** an empty field, **when** I paste 5000 characters into it, **then** typing is neither blocked nor cut short: every character I pasted is in the field, and I learn it is too long only when I try to commit.
- **Given** a request that reaches the server carrying an over-long name, **when** it is handled, **then** it is refused and nothing is written.

## Out of scope for this Story

Whitespace and control-character tidying (S-002-05), and refusals for any other reason (a stale copy — S-002-09). This slice is the length ceiling alone.

## Depends on

S-002-05 — the ceiling is measured against the tidied name, so tidying comes first.

## Satisfies

REQ-26, REQ-27

## Open questions

- Where is the refusal raised, and how does the message reach the year? ADR-003 puts the static `maxLength(255)` bound in the payload schema, which refuses the request as a whole; REQ-26 additionally requires the person be told *which year* is at fault. Either the editor checks before sending and names the year itself, or the server's refusal must carry the offending year back. Pick one before building.
- Is the offending year merely named in a message, or also marked on its own band?
- Is 255 counted in characters as a person sees them, or in the units the store counts? A title of 255 accented or emoji characters may exceed the column while looking within the rule.

## References

- PRD: [../../prd/002-list-contents.prd.md](../../prd/002-list-contents.prd.md) — the what & why
- ADR: [../../adr/003-whole-list-writes.md](../../adr/003-whole-list-writes.md) — the mechanism

## Definition of Done

Governed by the global [Definition of Done](../../DEFINITION-OF-DONE.md), on top of the Acceptance Criteria above.
