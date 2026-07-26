import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { FIRST_COVERED_YEAR } from "@boty/shared/api/rankings/items/coveredYears";
import { asc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { hashToken } from "../../../src/crypto/hashToken.ts";
import { PgDrizzle } from "../../../src/db/PgDrizzle.ts";
import { ownerTokensTable } from "../../../src/db/schema/owner-tokens.table.ts";
import { rankingItemsTable } from "../../../src/db/schema/ranking-items.table.ts";
import { rankingsTable } from "../../../src/db/schema/rankings.table.ts";
import { randomString } from "../../fixtures/helpers/random.ts";
import { newRanking } from "../../fixtures/ranking.fixture.ts";
import { makeTestCtx } from "../../setup/make-test-ctx.ts";

type Ctx = Awaited<ReturnType<typeof makeTestCtx>>;

// The stale stamp every seeded Ranking starts from, so "this write stamped the
// Ranking's own row" is observable without racing the clock.
const SEEDED_UPDATED_AT = new Date("2020-01-01T00:00:00.000Z");

// Covered Years is read on the UTC calendar, the same calendar the handler reads
// it in.
const CURRENT_YEAR = new Date().getUTCFullYear();

interface SeededItem {
	year: number;
	name: string;
}

/**
 * Seed one Ranking holding the given games, plus an Owner token granting one
 * browser edit access to it. Only the token's hash is stored, as the app stores
 * it; the raw token is unique per Ranking because the column is globally unique.
 */
async function seedOwnedRanking(ctx: Ctx, items: SeededItem[] = []) {
	const ownerToken = `owner-token-${randomString()}`;

	const rankingId = await ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;

			const [ranking] = yield* db
				.insert(rankingsTable)
				.values({
					...newRanking(),
					updatedAt: SEEDED_UPDATED_AT,
				})
				.returning({
					id: rankingsTable.id,
				});
			if (!ranking) {
				return yield* Effect.die("Failed to seed ranking row");
			}

			if (items.length > 0) {
				yield* db.insert(rankingItemsTable).values(
					items.map((item) => ({
						rankingId: ranking.id,
						...item,
					})),
				);
			}

			yield* db.insert(ownerTokensTable).values({
				rankingId: ranking.id,
				tokenHash: hashToken(ownerToken),
			});

			return ranking.id;
		}),
	);

	return {
		rankingId,
		ownerToken,
	};
}

/** The games a Ranking holds, read straight from the table, oldest year first. */
function storedItems(ctx: Ctx, rankingId: string) {
	return ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;
			return yield* db
				.select({
					year: rankingItemsTable.year,
					name: rankingItemsTable.name,
				})
				.from(rankingItemsTable)
				.where(eq(rankingItemsTable.rankingId, rankingId))
				.orderBy(asc(rankingItemsTable.year));
		}),
	);
}

interface RankingBody {
	id: string;
	username: string;
	updatedAt: string;
	items: {
		id: string;
		year: number;
		name: string;
	}[];
}

/**
 * PUT a whole list of Items. `authorization` is spelled out by every caller —
 * what credential a commit carries is the subject of half these tests — and
 * `null` sends no header at all.
 */
async function saveItems(
	ctx: Ctx,
	args: {
		rankingId: string;
		items: SeededItem[];
		authorization: string | null;
	},
) {
	const res = await ctx.handler(
		new Request(`http://localhost/rankings/${args.rankingId}/items`, {
			method: "PUT",
			headers: {
				"content-type": "application/json",
				...(args.authorization === null
					? {}
					: {
							authorization: args.authorization,
						}),
			},
			body: JSON.stringify({
				items: args.items,
			}),
		}),
	);

	const text = await res.text();
	return {
		status: res.status,
		json: (text ? JSON.parse(text) : {}) as Partial<RankingBody>,
	};
}

/** GET the same Ranking through the public read, as a reader would. */
async function readRanking(ctx: Ctx, rankingId: string) {
	const res = await ctx.handler(
		new Request(`http://localhost/rankings/${rankingId}`),
	);
	return {
		status: res.status,
		json: (await res.json()) as RankingBody,
	};
}

describe("PUT /rankings/:id/items", () => {
	let ctx: Ctx;

	beforeAll(async () => {
		ctx = await makeTestCtx();
	});

	afterAll(async () => {
		await ctx?.cleanup();
	});

	test("publishes a whole pass at once: one year added, one changed, one emptied", async () => {
		const { rankingId, ownerToken } = await seedOwnedRanking(ctx, [
			{
				year: 2020,
				name: "Hades",
			},
			{
				year: 2021,
				name: "It Takes Two",
			},
			{
				year: 2022,
				name: "Elden Ring",
			},
		]);

		const saved = await saveItems(ctx, {
			rankingId,
			authorization: `Bearer ${ownerToken}`,
			items: [
				{
					year: 2020,
					name: "Hades",
				},
				{
					year: 2021,
					name: "Psychonauts 2",
				},
				{
					year: 2023,
					name: "Baldur's Gate 3",
				},
			],
		});

		// The answer is the stored end state — newest-first, with 2022 gone because
		// the pass did not name it.
		expect(saved.status).toBe(200);
		expect(
			saved.json.items?.map((item) => ({
				year: item.year,
				name: item.name,
			})),
		).toEqual([
			{
				year: 2023,
				name: "Baldur's Gate 3",
			},
			{
				year: 2021,
				name: "Psychonauts 2",
			},
			{
				year: 2020,
				name: "Hades",
			},
		]);

		// A reader loading the list afterwards meets every change of that pass, and
		// nothing else.
		const read = await readRanking(ctx, rankingId);
		expect(read.status).toBe(200);
		expect(saved.json.items).toEqual(read.json.items);

		// The Ranking's own row carries the moment of the pass: this write touches
		// the items table, so nothing else would move that stamp.
		expect(new Date(read.json.updatedAt).getTime()).toBeGreaterThan(
			SEEDED_UPDATED_AT.getTime(),
		);
		expect(saved.json.updatedAt).toBe(read.json.updatedAt);
	});

	test("a pass naming no year leaves the ranking holding no games", async () => {
		const { rankingId, ownerToken } = await seedOwnedRanking(ctx, [
			{
				year: 2019,
				name: "Disco Elysium",
			},
			{
				year: 2020,
				name: "Hades",
			},
		]);

		const emptied = await saveItems(ctx, {
			rankingId,
			authorization: `Bearer ${ownerToken}`,
			items: [],
		});

		expect(emptied.status).toBe(200);
		expect(emptied.json.items).toEqual([]);
		expect(await storedItems(ctx, rankingId)).toEqual([]);
	});

	test("a ranking with no games at all accepts a pass naming none", async () => {
		const { rankingId, ownerToken } = await seedOwnedRanking(ctx);

		const accepted = await saveItems(ctx, {
			rankingId,
			authorization: `Bearer ${ownerToken}`,
			items: [],
		});

		expect(accepted.status).toBe(200);
		expect(accepted.json.items).toEqual([]);
	});

	describe("without edit access", () => {
		// Every refusal below attempts the same overwrite of the same seeded list,
		// so each one also proves the stored list was left exactly as it was.
		const SEEDED: SeededItem[] = [
			{
				year: 2022,
				name: "Elden Ring",
			},
		];
		const ATTEMPTED: SeededItem[] = [
			{
				year: 2022,
				name: "Overwritten",
			},
		];

		test("refuses a commit carrying no credential", async () => {
			const { rankingId } = await seedOwnedRanking(ctx, SEEDED);

			const refused = await saveItems(ctx, {
				rankingId,
				items: ATTEMPTED,
				authorization: null,
			});

			expect(refused.status).toBe(401);
			expect(await storedItems(ctx, rankingId)).toEqual(SEEDED);
		});

		test("refuses a commit whose credential is not a bearer token", async () => {
			const { rankingId, ownerToken } = await seedOwnedRanking(ctx, SEEDED);

			const refused = await saveItems(ctx, {
				rankingId,
				items: ATTEMPTED,
				authorization: ownerToken,
			});

			expect(refused.status).toBe(401);
			expect(await storedItems(ctx, rankingId)).toEqual(SEEDED);
		});

		test("refuses a commit presenting an unknown token", async () => {
			const { rankingId } = await seedOwnedRanking(ctx, SEEDED);

			const refused = await saveItems(ctx, {
				rankingId,
				items: ATTEMPTED,
				authorization: "Bearer no-browser-was-ever-given-this",
			});

			expect(refused.status).toBe(401);
			expect(await storedItems(ctx, rankingId)).toEqual(SEEDED);
		});

		test("refuses a commit presenting a token that belongs to another ranking", async () => {
			const { rankingId } = await seedOwnedRanking(ctx, SEEDED);
			const otherBrowser = await seedOwnedRanking(ctx);

			const refused = await saveItems(ctx, {
				rankingId,
				items: ATTEMPTED,
				authorization: `Bearer ${otherBrowser.ownerToken}`,
			});

			expect(refused.status).toBe(401);
			expect(await storedItems(ctx, rankingId)).toEqual(SEEDED);
		});

		test("tells a ranking that is gone apart from one that refuses access", async () => {
			const { ownerToken } = await seedOwnedRanking(ctx);
			const absentId = "00000000-0000-0000-0000-000000000000";

			const refused = await saveItems(ctx, {
				rankingId: absentId,
				items: ATTEMPTED,
				authorization: `Bearer ${ownerToken}`,
			});

			expect(refused.status).toBe(404);
		});
	});

	describe("years the site covers", () => {
		// Each pass below carries a legitimate change alongside the year under test,
		// so a refusal also shows that the legitimate change went nowhere.
		const LEGITIMATE: SeededItem = {
			year: 2022,
			name: "Elden Ring",
		};

		async function commitYear(year: number) {
			const { rankingId, ownerToken } = await seedOwnedRanking(ctx);

			const result = await saveItems(ctx, {
				rankingId,
				authorization: `Bearer ${ownerToken}`,
				items: [
					LEGITIMATE,
					{
						year,
						name: "The year under test",
					},
				],
			});

			return {
				...result,
				storedYears: (await storedItems(ctx, rankingId)).map(
					(item) => item.year,
				),
			};
		}

		test("accepts the first year of the span", async () => {
			const accepted = await commitYear(FIRST_COVERED_YEAR);

			expect(accepted.status).toBe(200);
			expect(accepted.storedYears).toContain(FIRST_COVERED_YEAR);
		});

		test("accepts the current year", async () => {
			const accepted = await commitYear(CURRENT_YEAR);

			expect(accepted.status).toBe(200);
			expect(accepted.storedYears).toContain(CURRENT_YEAR);
		});

		/**
		 * The year after the current one is deliberately accepted: the server's
		 * ceiling is one year looser than the editor's, so a browser whose clock has
		 * already turned over is not arbitrated against (ADR-003).
		 */
		test("accepts the year after the current one, tolerating a browser's clock", async () => {
			const accepted = await commitYear(CURRENT_YEAR + 1);

			expect(accepted.status).toBe(200);
			expect(accepted.storedYears).toContain(CURRENT_YEAR + 1);
		});

		test("refuses a year before the span, writing nothing at all", async () => {
			const refused = await commitYear(FIRST_COVERED_YEAR - 1);

			expect(refused.status).toBe(422);
			expect(refused.storedYears).toEqual([]);
		});

		test("refuses a year beyond the clock tolerance, writing nothing at all", async () => {
			const refused = await commitYear(CURRENT_YEAR + 2);

			expect(refused.status).toBe(422);
			expect(refused.storedYears).toEqual([]);
		});
	});

	describe("contract guards", () => {
		test("refuses a malformed ranking id", async () => {
			const refused = await saveItems(ctx, {
				rankingId: "not-a-uuid",
				items: [],
				authorization: "Bearer anything",
			});

			expect(refused.status).toBe(400);
		});

		test("refuses a pass naming the same year twice", async () => {
			const { rankingId, ownerToken } = await seedOwnedRanking(ctx);

			const refused = await saveItems(ctx, {
				rankingId,
				authorization: `Bearer ${ownerToken}`,
				items: [
					{
						year: 2022,
						name: "Elden Ring",
					},
					{
						year: 2022,
						name: "Tunic",
					},
				],
			});

			expect(refused.status).toBe(400);
			expect(await storedItems(ctx, rankingId)).toEqual([]);
		});

		test("refuses a name longer than the storage ceiling", async () => {
			const { rankingId, ownerToken } = await seedOwnedRanking(ctx);

			const refused = await saveItems(ctx, {
				rankingId,
				authorization: `Bearer ${ownerToken}`,
				items: [
					{
						year: 2022,
						name: "x".repeat(256),
					},
				],
			});

			expect(refused.status).toBe(400);
			expect(await storedItems(ctx, rankingId)).toEqual([]);
		});
	});
});
