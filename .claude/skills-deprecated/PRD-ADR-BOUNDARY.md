# The PRD/ADR boundary

Design decisions split across two artifacts at different altitudes. Use this rule
to decide where each one goes, and keep the two from bleeding into each other.

- The **PRD** (`docs/prd/NNNN-*.prd.md`) owns every **user-observable behavior**
  and all product scope — what gets built and why, from the user's perspective.
- An **ADR** (`docs/adr/NNNN-*.md`) records only the **invisible mechanism** that
  realizes those behaviors, plus the technical alternatives weighed.

## Bright-line test

**If a user could notice it, product owns it (PRD).**

This is what catches decisions that *feel* technical but are actually
behavioral. All of these belong in the PRD, never an ADR:

- "No email verification" — the user feels the absence of a confirm step.
- "Stays editable on this browser indefinitely" — observable behavior.
- "The recovery link works only once" — observable behavior.
- "Each device is independently authorized" — observable behavior.
- "Whoever holds the link/credential can edit" — observable behavior.

The matching *mechanism* for each — bearer token vs session, table layout,
storage/transport, hashing, expiry enforcement — is what goes in the ADR.

## Hard lines

- A **PRD never justifies architecture.** It states constraints and behavior,
  not their technical realization.
- An **ADR never redefines or restates product scope.** It **references** the
  PRD for behavior and for the *why*, and records only the machine.
- The two should **cross-reference** each other (PRD links the ADR for "how";
  the ADR links the PRD for "what / why").

When unsure which altitude a decision lives at, ask before recording it.
