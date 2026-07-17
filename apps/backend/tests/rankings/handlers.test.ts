import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { PgDrizzle } from "../../src/db/PgDrizzle.ts";
import { rankingItemsTable } from "../../src/db/schema/ranking-items.table.ts";
import { rankingsTable } from "../../src/db/schema/rankings.table.ts";
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

	test("returns 200 with the ranking and its items for a valid existing id", async () => {
		const { handler, runDb } = ctx;

		/**
		 * Seed one ranking row and two ranking items for the happy-path test
		 */
		const { ranking, items } = await runDb(
			Effect.gen(function* () {
				const db = yield* PgDrizzle;

				const [rankingRow] = yield* db
					.insert(rankingsTable)
					.values({
						...newRanking(),
						username: "the-username",
						updatedAt: new Date("2020-01-01T00:00:00.000Z"),
					})
					.returning({
						id: rankingsTable.id,
					});
				if (!rankingRow) {
					return yield* Effect.die("Failed to seed ranking row");
				}

				const itemRows = yield* db
					.insert(rankingItemsTable)
					.values([
						{
							rankingId: rankingRow.id,
							year: 2021,
							name: "It Takes Two",
						},
						{
							rankingId: rankingRow.id,
							year: 2023,
							name: "Baldur's Gate 3",
						},
						{
							rankingId: rankingRow.id,
							year: 2022,
							name: "Elden Ring",
						},
					])
					.returning({
						id: rankingItemsTable.id,
						year: rankingItemsTable.year,
						name: rankingItemsTable.name,
					});

				return {
					ranking: rankingRow,
					items: itemRows,
				};
			}),
		);

		const res = await handler(
			new Request(`http://localhost/rankings/${ranking.id}`),
		);

		expect(res.status).toBe(200);

		const body = (await res.json()) as {
			id: string;
			username: string;
			updatedAt: string;
			items: {
				id: string;
				year: number;
				name: string;
			}[];
		};
		/**
		 * Items were seeded scrambled (2021, 2023, 2022); the API guarantees
		 * newest-first, so assert the exact order here.
		 */
		const seeded = (year: number) => {
			const item = items.find((i) => i.year === year);
			if (!item) {
				throw new Error(`missing seeded item for ${year}`);
			}
			return item;
		};
		expect(body).toEqual({
			id: ranking.id,
			username: "the-username",
			updatedAt: "2020-01-01T00:00:00.000Z",
			items: [
				seeded(2023),
				seeded(2022),
				seeded(2021),
			],
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

	test("returns 400 for a malformed (non-UUID) id", async () => {
		const { handler } = ctx;
		const res = await handler(
			new Request("http://localhost/rankings/not-a-uuid"),
		);

		expect(res.status).toBe(400);
	});
});
