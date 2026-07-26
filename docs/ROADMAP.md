# Roadmap

Deferred work we intend to revisit.

## Auth & account recovery

- Recovery-abuse protection (rate limiting / throttling)
- Per-device revocation ("reset all tokens for this email")
- Editing username or email after a Ranking is claimed

## Ranking editing & management

- Compose a Ranking before claiming it (promised by PRD-001 REQ-1, not built)
- Add edit ranking button in view ranking page
- Warn before a save replaces an Item another session changed in the meantime
  (the editor currently keeps the typing session's version without saying so)
- Conflict resolution UI: show both versions of a year and let the person choose
- Archive ranking

## Localization

- Additional languages beyond English and French
- Grammatical pluralization rules (ICU-style, per-language)

## Developer tooling

- Add pre-commit check (typescript, lint, tests)
