import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { hashToken } from "../../src/crypto/hashToken.ts";
import { PgDrizzle } from "../../src/db/PgDrizzle.ts";
import { rankingsTable } from "../../src/db/schema/rankings.table.ts";
import { recoveryTokensTable } from "../../src/db/schema/recovery-tokens.table.ts";
import { newRanking } from "../fixtures/ranking.fixture.ts";
import { makeTestCtx } from "../setup/make-test-ctx.ts";

type Ctx = Awaited<ReturnType<typeof makeTestCtx>>;

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

/**
 * POST a recovery request and return the parsed response plus status. The body
 * is either the honest outcome (200) or a validation rejection code (422).
 */
async function recover(ctx: Ctx, email: string, language?: string) {
	const res = await ctx.handler(
		new Request("http://localhost/rankings/recover", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(
				language === undefined
					? {
							email,
						}
					: {
							email,
							language,
						},
			),
		}),
	);
	const json = (await res.json()) as {
		outcome?: string;
		code?: string;
		email?: string;
	};
	return {
		status: res.status,
		json,
	};
}

/** Seed one ranking with a known email; returns its id. */
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

/** All recovery_tokens rows currently in the isolated schema. */
function allRecoveryTokens(ctx: Ctx) {
	return ctx.runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;
			return yield* db.select().from(recoveryTokensTable);
		}),
	);
}

describe("POST /rankings/recover (request recovery)", () => {
	let ctx: Ctx;

	// Fresh isolated schema per test so the row-count and Mailer-call assertions
	// ("exactly one", "two distinct") stand on their own.
	beforeEach(async () => {
		ctx = await makeTestCtx();
	});

	afterEach(async () => {
		await ctx?.cleanup();
	});

	// A blank / whitespace-only email is refused as email_empty, with no
	// lookup — no token row and no email dispatched.
	test.each([
		[
			"",
			"blank email",
		],
		[
			"   ",
			"whitespace email",
		],
	])("refuses %p as email_empty (%s) and runs no lookup", async (email) => {
		const { status, json } = await recover(ctx, email);
		expect(status).toBe(422);
		expect(json.code).toBe("email_empty");
		expect(await allRecoveryTokens(ctx)).toHaveLength(0);
		expect(ctx.mailerCalls).toHaveLength(0);
	});

	// A malformed / over-length email is refused as email_invalid, no lookup.
	test.each([
		[
			"foo@",
			"missing domain",
		],
		[
			`${"a".repeat(250)}@b.com`,
			"longer than 254 chars",
		],
	])("refuses %p as email_invalid (%s) and runs no lookup", async (email) => {
		const { status, json } = await recover(ctx, email);
		expect(status).toBe(422);
		expect(json.code).toBe("email_invalid");
		expect(await allRecoveryTokens(ctx)).toHaveLength(0);
		expect(ctx.mailerCalls).toHaveLength(0);
	});

	// The email is matched ignoring letter case and surrounding whitespace.
	test("matches case- and whitespace-insensitively", async () => {
		await seedRanking(ctx, "Paulin@x.com");

		const { status, json } = await recover(ctx, "  paulin@x.com ");

		expect(status).toBe(200);
		expect(json.outcome).toBe("sent");
		expect(await allRecoveryTokens(ctx)).toHaveLength(1);
		expect(ctx.mailerCalls).toHaveLength(1);
	});

	// An email backing a ranking creates exactly one link (hash only, ~48h
	// expiry, unconsumed) and dispatches exactly one email carrying the raw token
	// in a /recover/ link built from the configured origin.
	test("issues one link and dispatches one email when the ranking exists", async () => {
		const rankingId = await seedRanking(ctx, "owner@example.com");

		const { status, json } = await recover(ctx, "owner@example.com");
		expect(status).toBe(200);
		expect(json.outcome).toBe("sent");

		const tokens = await allRecoveryTokens(ctx);
		expect(tokens).toHaveLength(1);
		const row = tokens[0];
		if (!row) {
			throw new Error("expected a recovery_tokens row");
		}
		expect(row.rankingId).toBe(rankingId);
		expect(row.consumedAt).toBeNull();
		expect(
			Math.abs(row.expiresAt.getTime() - (Date.now() + FORTY_EIGHT_HOURS_MS)),
		).toBeLessThan(60_000);

		expect(ctx.mailerCalls).toHaveLength(1);
		const call = ctx.mailerCalls[0];
		if (!call) {
			throw new Error("expected a Mailer call");
		}
		expect(call.to).toBe("owner@example.com");
		expect(call.url.startsWith(`${ctx.appBaseUrl}/recover/`)).toBe(true);

		// The link carries the RAW token; the DB holds only its hash. Verifying the
		// stored hash is the hash of the emailed token proves both at once.
		const rawToken = call.url.slice(`${ctx.appBaseUrl}/recover/`.length);
		expect(rawToken.length).toBeGreaterThan(20);
		expect(row.tokenHash).toBe(hashToken(rawToken));
		expect(row.tokenHash).not.toBe(rawToken);
	});

	// An email backing no ranking is refused as email_unknown (422), with no
	// link created and no email sent.
	test("refuses email_unknown without issuing or sending when no ranking exists", async () => {
		const { status, json } = await recover(ctx, "nobody@example.com");
		expect(status).toBe(422);
		expect(json.code).toBe("email_unknown");
		expect(await allRecoveryTokens(ctx)).toHaveLength(0);
		expect(ctx.mailerCalls).toHaveLength(0);
	});

	// Two requests create two distinct, independent links; neither dispatch
	// alters the other, and neither is consumed by issuing.
	test("creates two distinct independent links when requested twice", async () => {
		await seedRanking(ctx, "twice@example.com");

		const first = await recover(ctx, "twice@example.com");
		const second = await recover(ctx, "twice@example.com");
		expect(first.json.outcome).toBe("sent");
		expect(second.json.outcome).toBe("sent");

		const tokens = await allRecoveryTokens(ctx);
		expect(tokens).toHaveLength(2);
		expect(tokens[0]?.tokenHash).not.toBe(tokens[1]?.tokenHash);
		for (const row of tokens) {
			expect(row.consumedAt).toBeNull();
		}

		expect(ctx.mailerCalls).toHaveLength(2);
		expect(ctx.mailerCalls[0]?.url).not.toBe(ctx.mailerCalls[1]?.url);
	});

	// The request's Language is forwarded to the mailer, so the email is written
	// in the Language the person is currently reading.
	test("forwards the request Language to the mailer", async () => {
		await seedRanking(ctx, "fr@example.com");

		const { status } = await recover(ctx, "fr@example.com", "fr");

		expect(status).toBe(200);
		expect(ctx.mailerCalls).toHaveLength(1);
		expect(ctx.mailerCalls[0]?.language).toBe("fr");
	});

	// A missing or unsupported Language never fails recovery — the email falls
	// back to English rather than the request being refused.
	test.each([
		[
			undefined,
			"absent",
		],
		[
			"de",
			"unsupported",
		],
		[
			"EN",
			"wrong case",
		],
	])("falls back to English when the Language is %p (%s)", async (language) => {
		await seedRanking(ctx, "fallback@example.com");

		const { status } = await recover(ctx, "fallback@example.com", language);

		expect(status).toBe(200);
		expect(ctx.mailerCalls[0]?.language).toBe("en");
	});

	// Cross-cutting privacy: the response body never echoes the submitted email
	// nor the raw token, on either a sent confirmation or an unknown-email refusal.
	test("never echoes the email or the raw token in the response body", async () => {
		await seedRanking(ctx, "secret@example.com");

		const sent = await recover(ctx, "secret@example.com");
		const sentBody = JSON.stringify(sent.json);
		expect(sentBody).not.toContain("secret@example.com");
		const rawToken = ctx.mailerCalls[0]?.url.slice(
			`${ctx.appBaseUrl}/recover/`.length,
		);
		if (!rawToken) {
			throw new Error("expected a dispatched token");
		}
		expect(sentBody).not.toContain(rawToken);

		const miss = await recover(ctx, "ghost@example.com");
		expect(JSON.stringify(miss.json)).not.toContain("ghost@example.com");
	});
});
