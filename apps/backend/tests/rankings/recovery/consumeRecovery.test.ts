import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { hashToken } from "../../../src/crypto/hashToken.ts";
import { PgDrizzle } from "../../../src/db/PgDrizzle.ts";
import { ownerTokensTable } from "../../../src/db/schema/owner-tokens.table.ts";
import { rankingsTable } from "../../../src/db/schema/rankings.table.ts";
import { recoveryTokensTable } from "../../../src/db/schema/recovery-tokens.table.ts";
import { newRanking } from "../../fixtures/ranking.fixture.ts";
import { makeTestCtx } from "../../setup/make-test-ctx.ts";

type Ctx = Awaited<ReturnType<typeof makeTestCtx>>;

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

/**
 * POST a consume request and return the parsed response plus status. The body is
 * either the owner credentials (200) or a rejection code (422).
 */
async function consume(ctx: Ctx, token: string) {
	const res = await ctx.handler(
		new Request("http://localhost/recover/consume", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				token,
			}),
		}),
	);
	const json = (await res.json()) as {
		id?: string;
		ownerToken?: string;
		email?: string;
		code?: string;
	};
	return {
		status: res.status,
		json,
	};
}

/** Seed one ranking with a given email; returns its id. */
function seedRanking(ctx: Ctx, email: string) {
	return ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;
			const rows = yield* db
				.insert(rankingsTable)
				.values({
					...newRanking(),
					email,
				})
				.returning({
					id: rankingsTable.id,
				});
			const row = rows[0];
			if (!row) {
				throw new Error("seed insert returned no row");
			}
			return row.id;
		}),
	);
}

/**
 * Seed a recovery link for a ranking, storing only the hash of the given raw
 * token — the same at-rest shape the request flow writes. Defaults to a valid,
 * unused, unexpired link (expires 48h out, never consumed); `expiresAt` and
 * `consumedAt` can be overridden to stand up expired or already-used links.
 */
function seedRecoveryLink(
	ctx: Ctx,
	rankingId: string,
	rawToken: string,
	overrides: {
		expiresAt?: Date;
		consumedAt?: Date;
	} = {},
) {
	return ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;
			yield* db.insert(recoveryTokensTable).values({
				rankingId,
				tokenHash: hashToken(rawToken),
				expiresAt:
					overrides.expiresAt ?? new Date(Date.now() + FORTY_EIGHT_HOURS_MS),
				consumedAt: overrides.consumedAt ?? null,
			});
		}),
	);
}

/** The `consumedAt` timestamp currently held for a link, by its raw token. */
function consumedAtFor(ctx: Ctx, rawToken: string) {
	return ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;
			const rows = yield* db
				.select({
					consumedAt: recoveryTokensTable.consumedAt,
				})
				.from(recoveryTokensTable)
				.where(eq(recoveryTokensTable.tokenHash, hashToken(rawToken)));
			return rows[0]?.consumedAt ?? null;
		}),
	);
}

/** Seed a pre-existing owner token (hash only) for a ranking. */
function seedOwnerToken(ctx: Ctx, rankingId: string, rawToken: string) {
	return ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;
			yield* db.insert(ownerTokensTable).values({
				rankingId,
				tokenHash: hashToken(rawToken),
			});
		}),
	);
}

/** Every owner-token hash currently held for a ranking. */
function ownerTokenHashesFor(ctx: Ctx, rankingId: string) {
	return ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;
			const rows = yield* db
				.select({
					tokenHash: ownerTokensTable.tokenHash,
				})
				.from(ownerTokensTable)
				.where(eq(ownerTokensTable.rankingId, rankingId));
			return rows.map((row) => row.tokenHash);
		}),
	);
}

describe("POST /recover/consume (consume recovery link)", () => {
	let ctx: Ctx;

	beforeAll(async () => {
		ctx = await makeTestCtx();
	});

	afterAll(async () => {
		await ctx?.cleanup();
	});

	// The suite shares one schema, so reset to empty rankings before each test
	// (owner and recovery tokens cascade via their FKs).
	beforeEach(async () => {
		await ctx.runDb(
			Effect.gen(function* () {
				const db = yield* PgDrizzle;
				yield* db.delete(rankingsTable);
			}),
		);
	});

	// Consuming a valid link returns owner credentials for the requester's own
	// ranking, and the minted token grants owner access to that ranking — proven
	// by the DB holding its hash against that ranking id.
	test("mints an owner token for the ranking the link is bound to", async () => {
		const rankingId = await seedRanking(ctx, "owner@example.com");
		await seedRecoveryLink(ctx, rankingId, "raw-recovery-token");

		const { status, json } = await consume(ctx, "raw-recovery-token");

		expect(status).toBe(200);
		expect(json.id).toBe(rankingId);
		const ownerToken = json.ownerToken;
		if (typeof ownerToken !== "string") {
			throw new Error("consume response is missing ownerToken");
		}
		expect(ownerToken.length).toBeGreaterThan(20);

		// The minted token authorizes for that ranking: the DB holds its hash
		// against the bound ranking id, never the raw token.
		const hashes = await ownerTokenHashesFor(ctx, rankingId);
		expect(hashes).toContain(hashToken(ownerToken));
		expect(hashes).not.toContain(ownerToken);
	});

	// Recovery is additive: a browser that already held an owner token keeps it,
	// so after consuming on a new browser both tokens authorize the same ranking.
	test("adds a token without revoking one an existing browser already holds", async () => {
		const rankingId = await seedRanking(ctx, "additive@example.com");
		await seedOwnerToken(ctx, rankingId, "existing-browser-token");
		await seedRecoveryLink(ctx, rankingId, "raw-recovery-token");

		const { status, json } = await consume(ctx, "raw-recovery-token");
		expect(status).toBe(200);
		if (typeof json.ownerToken !== "string") {
			throw new Error("consume response is missing ownerToken");
		}

		// Both the pre-existing token and the freshly minted one authorize the
		// ranking — recovery revoked nothing.
		const hashes = await ownerTokenHashesFor(ctx, rankingId);
		expect(hashes).toContain(hashToken("existing-browser-token"));
		expect(hashes).toContain(hashToken(json.ownerToken));
		expect(hashes).toHaveLength(2);
	});

	// A link only ever restores access to its own ranking: consuming ranking A's
	// link mints a token bound to A and leaves an unrelated ranking B untouched.
	test("restores access only to the ranking the link belongs to", async () => {
		const rankingA = await seedRanking(ctx, "a@example.com");
		const rankingB = await seedRanking(ctx, "b@example.com");
		await seedRecoveryLink(ctx, rankingA, "raw-recovery-token");

		const { status, json } = await consume(ctx, "raw-recovery-token");
		expect(status).toBe(200);
		expect(json.id).toBe(rankingA);

		// The mint landed on A; B gained no token.
		expect(await ownerTokenHashesFor(ctx, rankingA)).toHaveLength(1);
		expect(await ownerTokenHashesFor(ctx, rankingB)).toHaveLength(0);
	});

	test("refuses an unknown token as link_invalid", async () => {
		const { status, json } = await consume(ctx, "never-issued-token");

		expect(status).toBe(422);
		expect(json.code).toBe("link_invalid");
	});

	// A link that was already spent no longer grants access: it is refused as
	// used and mints nothing new.
	test("refuses an already-consumed link as link_used, minting no token", async () => {
		const rankingId = await seedRanking(ctx, "used@example.com");
		await seedRecoveryLink(ctx, rankingId, "spent-token", {
			consumedAt: new Date(Date.now() - 60 * 1000),
		});

		const { status, json } = await consume(ctx, "spent-token");

		expect(status).toBe(422);
		expect(json.code).toBe("link_used");
		expect(await ownerTokenHashesFor(ctx, rankingId)).toHaveLength(0);
	});

	// Used wins over expired: a link that is both consumed and past its expiry is
	// reported as used, not expired.
	test("reports a link that is both used and expired as link_used", async () => {
		const rankingId = await seedRanking(ctx, "used-and-expired@example.com");
		await seedRecoveryLink(ctx, rankingId, "spent-and-stale-token", {
			consumedAt: new Date(Date.now() - 60 * 1000),
			expiresAt: new Date(Date.now() - FORTY_EIGHT_HOURS_MS),
		});

		const { status, json } = await consume(ctx, "spent-and-stale-token");

		expect(status).toBe(422);
		expect(json.code).toBe("link_used");
	});

	// A link issued more than 48h ago no longer grants access: it is refused as
	// expired and mints nothing new.
	test("refuses an expired, unused link as link_expired, minting no token", async () => {
		const rankingId = await seedRanking(ctx, "expired@example.com");
		await seedRecoveryLink(ctx, rankingId, "stale-token", {
			expiresAt: new Date(Date.now() - 60 * 1000),
		});

		const { status, json } = await consume(ctx, "stale-token");

		expect(status).toBe(422);
		expect(json.code).toBe("link_expired");
		expect(await ownerTokenHashesFor(ctx, rankingId)).toHaveLength(0);
	});

	// A link comfortably inside the 48h window still grants access — the boundary
	// is future expiry, so a link that expires shortly from now is valid.
	test("still grants access to an unused link whose expiry is in the future", async () => {
		const rankingId = await seedRanking(ctx, "fresh@example.com");
		await seedRecoveryLink(ctx, rankingId, "fresh-token", {
			expiresAt: new Date(Date.now() + 60 * 1000),
		});

		const { status, json } = await consume(ctx, "fresh-token");

		expect(status).toBe(200);
		expect(json.id).toBe(rankingId);
	});

	// Consuming one link never touches the others issued for the same ranking:
	// after spending the first, a second valid link still grants access.
	test("leaves other outstanding links for the same ranking usable", async () => {
		const rankingId = await seedRanking(ctx, "many-links@example.com");
		await seedRecoveryLink(ctx, rankingId, "first-token");
		await seedRecoveryLink(ctx, rankingId, "second-token");

		const first = await consume(ctx, "first-token");
		expect(first.status).toBe(200);
		expect(first.json.id).toBe(rankingId);

		const second = await consume(ctx, "second-token");
		expect(second.status).toBe(200);
		expect(second.json.id).toBe(rankingId);
	});

	// Consuming a link marks only that link used: its own `consumedAt` is set
	// while a sibling link's stays null and remains consumable.
	test("marks only the consumed link, leaving its siblings unconsumed", async () => {
		const rankingId = await seedRanking(ctx, "mark-one@example.com");
		await seedRecoveryLink(ctx, rankingId, "consumed-token");
		await seedRecoveryLink(ctx, rankingId, "sibling-token");

		const { status } = await consume(ctx, "consumed-token");
		expect(status).toBe(200);

		// The consumed link now carries a timestamp; the sibling is untouched.
		expect(await consumedAtFor(ctx, "consumed-token")).not.toBeNull();
		expect(await consumedAtFor(ctx, "sibling-token")).toBeNull();

		// And the untouched sibling still grants access.
		const sibling = await consume(ctx, "sibling-token");
		expect(sibling.status).toBe(200);
		expect(sibling.json.id).toBe(rankingId);
	});
});
