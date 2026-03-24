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
