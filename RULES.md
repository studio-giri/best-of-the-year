## Formatting

- Indentation: tabs, size 2
- Line endings: LF, final newline
- Quote style: double
- Semicolons: always

## Effect-specific patterns

- Use Effect.gen over pipe

## Code Style: Comment Blocks

Code must be organized into **logical blocks** — each preceded by a comment, separated by a blank line.

**Rules:**
- One block = one logical step. The block can consist of several instructions if they fit well together.
- Comments describe *intent*, not mechanics. `// fetch the user` → bad. `// Fetch user to validate session ownership` → good.
- Agents writing or modifying code must follow this structure as closely as possible.

**Example:**
```ts
/**
 * Fetch the remote resource, propagating network errors as FetchError
 */
const response = yield* Effect.tryPromise({
	try: () => fetch(...),
	catch: (...) => new FetchError(...),
});
if (!response.ok) {
	return yield* new FetchError(...);
}

/**
 * Decode the response body against MySchema, failing fast on shape mismatches
 */
const json = yield* Effect.tryPromise({
	try: () => response.json(),
	catch: () => new JsonError(),
});
return yield* Schema.decodeUnknown(MySchema)(json);
```

## Prohibitions (what not to do)
- No any, no as casts without justification
- No raw promise-based code outside of Effect wrappers

## Dependencies

All dependencies in package.json (except workspace:*) must be pinned (bun must be run with --exact when installing)

## File structure

Prefer many small, focused files over large catch-all modules.

- One exported function / class / constant per file when it makes sense
- No `helpers.ts`, `utils.ts`, or `common.ts` dumping grounds — name files after what they do (`format-date.ts`, `parse-ocpi-response.ts`)
- Colocate files with their consumers rather than grouping by type (e.g. avoid a flat `/utils` folder at the root, unless there are shared utils)

## Frontend file organization

`apps/frontend/src/` is organized by page, mirroring the URL structure — not by type, not by domain.

```text
src/
├── routes/      # framework-owned (TanStack Router), thin wiring ONLY: route definition, loader, param→prop plumbing
├── pages/       # mirrors the URL tree: pages/home/, pages/game/ranking/ (= /game/$rankingId)
├── layout/      # app shell (Layout, Header, Footer) — used by routes, not a page
├── ui/          # shared, domain-less primitives (e.g. HorizontalRule)
└── lib/         # infra (API client)
```

- A page folder holds everything the page needs: components, queries, hooks (e.g. `pages/game/ranking/{RankingPage,Ranking,RankingItem,RankingNotFound}.tsx`, `useRanking.query.ts`)
- **No sibling imports between page folders** — `pages/home/` never imports from `pages/game/`. Wanting to is the promotion signal: move the file to `ui/` (generic primitive) or a purpose-named shared folder, created at that moment, not before (promote on second use)
- **Routes import pages, never the reverse** — a URL refactor is then a folder move plus one import update
- No barrel files (`index.ts`) — import files directly
