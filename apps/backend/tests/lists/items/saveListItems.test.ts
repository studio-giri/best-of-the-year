import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { FIRST_COVERED_YEAR } from "@boty/shared/api/lists/items/coveredYears";
import { asc, eq } from "drizzle-orm";
import { Effect } from "effect";
import { hashToken } from "../../../src/crypto/hashToken.ts";
import { PgDrizzle } from "../../../src/db/PgDrizzle.ts";
import { listItemsTable } from "../../../src/db/schema/list-items.table.ts";
import { listsTable } from "../../../src/db/schema/lists.table.ts";
import { ownerTokensTable } from "../../../src/db/schema/owner-tokens.table.ts";
import { randomString } from "../../fixtures/helpers/random.ts";
import { newList } from "../../fixtures/list.fixture.ts";
import { makeTestCtx } from "../../setup/make-test-ctx.ts";

type Ctx = Awaited<ReturnType<typeof makeTestCtx>>;

// The stale stamp every seeded List starts from, so "this write stamped the
// List's own row" is observable without racing the clock.
const SEEDED_UPDATED_AT = new Date("2020-01-01T00:00:00.000Z");

// Covered Years is read on the UTC calendar, the same calendar the handler reads
// it in.
const CURRENT_YEAR = new Date().getUTCFullYear();

interface SeededItem {
	year: number;
	name: string;
}

/**
 * Seed one List holding the given games, plus an Owner token granting one
 * browser edit access to it. Only the token's hash is stored, as the app stores
 * it; the raw token is unique per List because the column is globally unique.
 */
async function seedOwnedList(ctx: Ctx, items: SeededItem[] = []) {
	const ownerToken = `owner-token-${randomString()}`;

	const listId = await ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;

			const [list] = yield* db
				.insert(listsTable)
				.values({
					...newList(),
					updatedAt: SEEDED_UPDATED_AT,
				})
				.returning({
					id: listsTable.id,
				});
			if (!list) {
				return yield* Effect.die("Failed to seed list row");
			}

			if (items.length > 0) {
				yield* db.insert(listItemsTable).values(
					items.map((item) => ({
						listId: list.id,
						...item,
					})),
				);
			}

			yield* db.insert(ownerTokensTable).values({
				listId: list.id,
				tokenHash: hashToken(ownerToken),
			});

			return list.id;
		}),
	);

	return {
		listId,
		ownerToken,
	};
}

/** The games a List holds, read straight from the table, oldest year first. */
function storedItems(ctx: Ctx, listId: string) {
	return ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;
			return yield* db
				.select({
					year: listItemsTable.year,
					name: listItemsTable.name,
				})
				.from(listItemsTable)
				.where(eq(listItemsTable.listId, listId))
				.orderBy(asc(listItemsTable.year));
		}),
	);
}

interface ListBody {
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
		listId: string;
		items: SeededItem[];
		authorization: string | null;
	},
) {
	const res = await ctx.handler(
		new Request(`http://localhost/lists/${args.listId}/items`, {
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
		// A refusal answers with its tag rather than a List, and two different
		// refusals share the 422 — so the tag is what tells them apart.
		json: (text ? JSON.parse(text) : {}) as Partial<ListBody> & {
			_tag?: string;
		},
	};
}

/** GET the same List through the public read, as a reader would. */
async function readList(ctx: Ctx, listId: string) {
	const res = await ctx.handler(
		new Request(`http://localhost/lists/${listId}`),
	);
	return {
		status: res.status,
		json: (await res.json()) as ListBody,
	};
}

describe("PUT /lists/:id/items", () => {
	let ctx: Ctx;

	beforeAll(async () => {
		ctx = await makeTestCtx();
	});

	afterAll(async () => {
		await ctx?.cleanup();
	});

	test("publishes a whole pass at once: one year added, one changed, one emptied", async () => {
		const { listId, ownerToken } = await seedOwnedList(ctx, [
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
			listId,
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
		const read = await readList(ctx, listId);
		expect(read.status).toBe(200);
		expect(saved.json.items).toEqual(read.json.items);

		// The List's own row carries the moment of the pass: this write touches
		// the items table, so nothing else would move that stamp.
		expect(new Date(read.json.updatedAt).getTime()).toBeGreaterThan(
			SEEDED_UPDATED_AT.getTime(),
		);
		expect(saved.json.updatedAt).toBe(read.json.updatedAt);
	});

	test("List cannot be emptied", async () => {
		const originalList = [
			{
				year: 2019,
				name: "Disco Elysium",
			},
			{
				year: 2020,
				name: "Hades",
			},
		];
		const { listId, ownerToken } = await seedOwnedList(ctx, originalList);

		// Emptying the last one is not: the pass is refused whole, and the game the
		// list already published is still there.
		const refused = await saveItems(ctx, {
			listId,
			authorization: `Bearer ${ownerToken}`,
			items: [],
		});

		expect(refused.status).toBe(422);
		expect(refused.json._tag).toBe("ListWouldBeEmpty");
		expect(await storedItems(ctx, listId)).toEqual(originalList);
	});

	test("lets the last game be replaced, so a single-game list is not frozen", async () => {
		const { listId, ownerToken } = await seedOwnedList(ctx, [
			{
				year: 2020,
				name: "Hades",
			},
		]);

		const replaced = await saveItems(ctx, {
			listId,
			authorization: `Bearer ${ownerToken}`,
			items: [
				{
					year: 2011,
					name: "Portal 2",
				},
			],
		});

		expect(replaced.status).toBe(200);
		expect(await storedItems(ctx, listId)).toEqual([
			{
				year: 2011,
				name: "Portal 2",
			},
		]);
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
			const { listId } = await seedOwnedList(ctx, SEEDED);

			const refused = await saveItems(ctx, {
				listId,
				items: ATTEMPTED,
				authorization: null,
			});

			expect(refused.status).toBe(401);
			expect(await storedItems(ctx, listId)).toEqual(SEEDED);
		});

		test("refuses a commit whose credential is not a bearer token", async () => {
			const { listId, ownerToken } = await seedOwnedList(ctx, SEEDED);

			const refused = await saveItems(ctx, {
				listId,
				items: ATTEMPTED,
				authorization: ownerToken,
			});

			expect(refused.status).toBe(401);
			expect(await storedItems(ctx, listId)).toEqual(SEEDED);
		});

		test("refuses a commit presenting an unknown token", async () => {
			const { listId } = await seedOwnedList(ctx, SEEDED);

			const refused = await saveItems(ctx, {
				listId,
				items: ATTEMPTED,
				authorization: "Bearer no-browser-was-ever-given-this",
			});

			expect(refused.status).toBe(401);
			expect(await storedItems(ctx, listId)).toEqual(SEEDED);
		});

		test("refuses a commit presenting a token that belongs to another list", async () => {
			const { listId } = await seedOwnedList(ctx, SEEDED);
			const otherBrowser = await seedOwnedList(ctx);

			const refused = await saveItems(ctx, {
				listId,
				items: ATTEMPTED,
				authorization: `Bearer ${otherBrowser.ownerToken}`,
			});

			expect(refused.status).toBe(401);
			expect(await storedItems(ctx, listId)).toEqual(SEEDED);
		});

		test("tells a list that is gone apart from one that refuses access", async () => {
			const { ownerToken } = await seedOwnedList(ctx);
			const absentId = "00000000-0000-0000-0000-000000000000";

			const refused = await saveItems(ctx, {
				listId: absentId,
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
			const { listId, ownerToken } = await seedOwnedList(ctx);

			const result = await saveItems(ctx, {
				listId,
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
				storedYears: (await storedItems(ctx, listId)).map((item) => item.year),
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
		test("refuses a malformed list id", async () => {
			const refused = await saveItems(ctx, {
				listId: "not-a-uuid",
				items: [],
				authorization: "Bearer anything",
			});

			expect(refused.status).toBe(400);
		});

		test("refuses a pass naming the same year twice", async () => {
			const { listId, ownerToken } = await seedOwnedList(ctx);

			const refused = await saveItems(ctx, {
				listId,
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
			expect(await storedItems(ctx, listId)).toEqual([]);
		});

		test("refuses a name longer than the storage ceiling", async () => {
			const { listId, ownerToken } = await seedOwnedList(ctx);

			const refused = await saveItems(ctx, {
				listId,
				authorization: `Bearer ${ownerToken}`,
				items: [
					{
						year: 2022,
						name: "x".repeat(256),
					},
				],
			});

			expect(refused.status).toBe(400);
			expect(await storedItems(ctx, listId)).toEqual([]);
		});
	});
});
