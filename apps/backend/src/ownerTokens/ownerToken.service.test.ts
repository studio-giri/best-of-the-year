import { describe, expect, mock, test } from "bun:test";
import { Effect } from "effect";
import { hashToken } from "../crypto/hashToken.ts";
import { PgDrizzle } from "../db/PgDrizzle.ts";
import { ownerTokensTable } from "../db/schema/owner-tokens.table.ts";
import { mintOwnerToken } from "./ownerToken.service.ts";

/**
 * Mock the `insert(table).values(...)` chain the service touches:
 * `insert` returns the builder;
 * `values` resolves like a successful write.
 */
function makeMockDb() {
	const values = mock(() => Effect.succeed([]));
	const insert = mock(() => ({
		values,
	}));
	const db = {
		insert,
	} as unknown as typeof PgDrizzle.Service;

	return {
		db,
		insert,
		values,
	};
}

const run = (db: typeof PgDrizzle.Service) => (rankingId: string) =>
	Effect.runPromise(
		mintOwnerToken(rankingId).pipe(Effect.provideService(PgDrizzle, db)),
	);

/**
 * Unit test with the DB mocked: we stub PgDrizzle's insert builder to capture
 * what would be written, so the test stays hermetic (no PostgreSQL) and asserts
 * the service's contract — persist only the hash, hand back the raw token.
 */
describe("mintOwnerToken", () => {
	test("persists only the token hash and returns the raw token", async () => {
		const { db, insert, values } = makeMockDb();
		const rankingId = "11111111-1111-1111-1111-111111111111";

		const token = await run(db)(rankingId);

		// Exactly one write, into owner_tokens, persisting the hash — not the raw token.
		expect(insert).toHaveBeenCalledWith(ownerTokensTable);
		expect(values).toHaveBeenCalledTimes(1);
		expect(values).toHaveBeenCalledWith({
			rankingId,
			tokenHash: hashToken(token),
		});

		// The raw token comes back as a 32-byte base64url secret (43 chars, no padding).
		expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
	});

	test("mints a distinct token on each call", async () => {
		const { db } = makeMockDb();
		const rankingId = "22222222-2222-2222-2222-222222222222";

		const [a, b] = await Promise.all([
			run(db)(rankingId),
			run(db)(rankingId),
		]);

		expect(a).not.toBe(b);
	});
});
