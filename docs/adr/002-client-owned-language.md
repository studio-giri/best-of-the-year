# Client-owned Language, localized on the client except the email

English/French localization. This ADR records how Language is carried and resolved.

## Decision

**Language is client-owned and never stored server-side** — no column, no per-person row — consistent with the account-less design (ADR-001).

- The person's Language lives in a **cookie**, readable at render time so SSR emits the right `<html lang>` and copy on the first byte. Precedence: **cookie › `Accept-Language` › English**.
- **The API speaks codes, never prose.** All localization of API responses happens client-side, via a **hand-rolled, per-Language typed catalog** (a missing translation is a compile error). `Accept-Language` negotiation uses `@formatjs/intl-localematcher`.
- **The email is localized server-side, because the server renders it.** Its Language rides in the recovery **request body** and passes straight to the `@boty/emails` renderer — stateless, never persisted. The field is a lenient string the handler coerces, falling back to English so a cosmetic detail can never turn recovery — the lockout safety net — into a 400.
- **One canonical `Language` type** (`Schema.Literal("en", "fr")`) lives in `@boty/shared`, used by frontend and backend. `@boty/emails` keeps its own local `"en" | "fr"` type to stay dependency-minimal; drift is caught at the backend call site, the renderer's sole caller.

## Considered options

- **`localStorage` for the preference** — rejected: invisible to SSR, causing a flash of English and a `<html lang>` hydration mismatch on every load.
- **Language segment in the URL (`/fr/…`)** — rejected: restructures the route tree for SEO/shareability this app doesn't need, and is wrong for the main shareable surface (a public Ranking should render in the *viewer's* Language, not the author's).
- **Storing Language server-side** — rejected: the only per-person server-side preference, contradicting the account-less design, and it buys nothing the cookie doesn't.
- **A full i18n framework (`react-i18next` et al.)** — rejected: its detector is client-side and doesn't solve SSR detection, and its string-keyed runtime lookups fight this repo's compile-time-typed grain. Overweight for two languages.

## Consequences

- The backend has no notion of Language outside a single request: nothing to migrate, but no server-side record of anyone's preference.
- Adding a language: extend the `Language` literal, fill the catalog (the compiler lists every missing string), add the email dictionary entry. No data migration.
