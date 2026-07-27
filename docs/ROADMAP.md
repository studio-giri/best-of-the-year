# Roadmap

Deferred work we intend to revisit.

## Auth & account recovery

- Recovery-abuse protection (rate limiting / throttling)
- Per-device revocation ("reset all tokens for this email")
- Editing username or email after a List is claimed

## List editing & management

- Compose a List before claiming it (promised by PRD-001 REQ-1, not built)
- Add edit list button in view list page
- Warn before a save replaces an Item another session changed in the meantime
  (the editor currently keeps the typing session's version without saying so)
- Conflict resolution UI: show both versions of a year and let the person choose
- Confirmation prompt before a save that empties many Items at once, so nobody
  wipes their list by accident (threshold to define — e.g. 3+ removals, or any
  save that clears most of the list)
- Archive list

## Localization

- Additional languages beyond English and French
- Grammatical pluralization rules (ICU-style, per-language)

## Developer tooling

- Add pre-commit check (typescript, lint, tests)
