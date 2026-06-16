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

## Dependencies

All dependencies in package.json (except workspace:*) must be pinned (bun must be run with --exact when installing)

### TanStack packages bump as a constellation

TanStack versions its packages independently — there is no single version number to align on (e.g. the latest `react-router-devtools` can be 1.167.x while the latest `react-router` is 1.170.x; that skew is normal). The invariant that matters: **`@tanstack/react-start`'s internals pin exact versions of `@tanstack/react-router` and `@tanstack/router-plugin`**, so:

- Never bump `react-router` (or `router-plugin`) alone — bun would install a second copy of the router core and break React context identity at runtime.
- To upgrade, pick the target `react-start` version first, then pin `react-router` to whatever it dictates (`npm view @tanstack/react-start@<version> dependencies`).
- After any TanStack bump, verify a single resolution: `bun why @tanstack/router-core` must show exactly one version.

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
