import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Effect } from "effect";
import { rankingsTable } from "../../src/db/schema.ts";
import { newRanking } from "../fixtures/ranking.fixture.ts";
import { makeTestCtx } from "../setup/make-test-ctx.ts";

describe("GET /rankings/:id", () => {
	let ctx: Awaited<ReturnType<typeof makeTestCtx>>;

	beforeAll(async () => {
		ctx = await makeTestCtx();
	});

	afterAll(async () => {
		await ctx?.cleanup();
	});

	test("returns 200 with the ranking for a valid existing id", async () => {
		const { handler, runDb } = ctx;

		/**
		 * Seed one ranking row for the happy-path tests
		 */
		const [row] = await runDb(
			Effect.gen(function* () {
				const db = yield* PgDrizzle;
				return yield* db
					.insert(rankingsTable)
					.values({
						...newRanking(),
						author: "the-author",
						updatedAt: new Date("2020-01-01T00:00:00.000Z"),
					})
					.returning({
						id: rankingsTable.id,
					})
					.pipe(Effect.orDie);
			}),
		);
		if (!row) {
			throw new Error("Failed to seed ranking row");
		}

		const res = await handler(
			new Request(`http://localhost/rankings/${row.id}`),
		);

		expect(res.status).toBe(200);

		const body = (await res.json()) as {
			id: string;
			author: string;
			updatedAt: string;
		};
		expect(body).toEqual({
			id: row.id,
			author: "the-author",
			updatedAt: "2020-01-01T00:00:00.000Z",
		});
	});

	test("returns 404 for a valid UUID that does not exist", async () => {
		const { handler } = ctx;
		const nonExistentId = "00000000-0000-0000-0000-000000000000";
		const res = await handler(
			new Request(`http://localhost/rankings/${nonExistentId}`),
		);

		expect(res.status).toBe(404);
	});

	test("returns 404 for a malformed (non-UUID) id", async () => {
		const { handler } = ctx;
		const res = await handler(
			new Request("http://localhost/rankings/not-a-uuid"),
		);

		expect(res.status).toBe(404);
	});

	test("returns 404 for a soft-deleted ranking", async () => {
		const { handler, runDb } = ctx;

		/**
		 * Seed a dedicated row so this test is fully isolated
		 */
		const [row] = await runDb(
			Effect.gen(function* () {
				const db = yield* PgDrizzle;
				return yield* db
					.insert(rankingsTable)
					.values({
						...newRanking(),
						deletedAt: new Date(),
					})
					.returning({
						id: rankingsTable.id,
					})
					.pipe(Effect.orDie);
			}),
		);
		if (!row) {
			throw new Error("Failed to seed ranking row");
		}

		const res = await handler(
			new Request(`http://localhost/rankings/${row.id}`),
		);
		expect(res.status).toBe(404);
	});
});
