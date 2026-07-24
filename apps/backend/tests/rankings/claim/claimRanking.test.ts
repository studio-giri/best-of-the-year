import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { Effect } from "effect";
import { PgDrizzle } from "../../../src/db/PgDrizzle.ts";
import { ownerTokensTable } from "../../../src/db/schema/owner-tokens.table.ts";
import { rankingsTable } from "../../../src/db/schema/rankings.table.ts";
import { makeTestCtx } from "../../setup/make-test-ctx.ts";

type Ctx = Awaited<ReturnType<typeof makeTestCtx>>;
type Handler = Ctx["handler"];

/**
 * POST a claim and return the parsed response plus status. Centralizes the
 * request shape so each test asserts only what it cares about.
 */
async function claim(
	handler: Handler,
	body: {
		email: string;
		username: string;
	},
) {
	const res = await handler(
		new Request("http://localhost/rankings", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(body),
		}),
	);
	const json = (await res.json()) as {
		id?: string;
		username?: string;
		ownerToken?: string;
		email?: string;
		code?: string;
	};
	return {
		status: res.status,
		json,
	};
}

/**
 * Insert an already-claimed ranking directly (bypassing the API) so a test can
 * arrange the "already taken" precondition without spending its one API call on
 * setup. Values are stored as a real claim would store them — trimmed, in the
 * chosen casing — so the collision tests exercise the case/whitespace-insensitive
 * unique indexes. No owner token is needed: the duplicate guards live entirely
 * on the rankings table.
 */
async function seedRanking(
	runDb: Ctx["runDb"],
	values: {
		email: string;
		username: string;
	},
) {
	await runDb(
		Effect.gen(function* () {
			const db = yield* PgDrizzle;
			yield* db.insert(rankingsTable).values(values);
		}),
	);
}

// An already-claimed ranking the collision tests refute against. Each collision
// test seeds this itself, so the constants are just the canonical stored forms;
// tests vary case and whitespace around them.
const EXISTING_EMAIL = "existing@example.com";
const EXISTING_USERNAME = "Existing-Owner";

describe("POST /rankings (claim)", () => {
	let ctx: Ctx;

	beforeAll(async () => {
		ctx = await makeTestCtx();
	});

	afterAll(async () => {
		await ctx?.cleanup();
	});

	// The suite shares one schema, so reset to an empty rankings table before each
	// test — this is what lets every test run independently, in any order or alone
	// (deleting rankings cascades to their owner tokens via the FK).
	beforeEach(async () => {
		await ctx.runDb(
			Effect.gen(function* () {
				const db = yield* PgDrizzle;
				yield* db.delete(rankingsTable);
			}),
		);
	});

	// The success path, asserted end-to-end from a single claim: a valid email +
	// unused username creates the ranking, returns owner credentials (never the
	// email), stores the username trimmed in its chosen casing, and persists only
	// the SHA-256 hash of the token.
	test("creates a ranking, trims the username, and stores only the token hash", async () => {
		const { handler, runDb } = ctx;

		const { status, json } = await claim(handler, {
			email: "claimer@example.com",
			username: "  Paulin ",
		});

		expect(status).toBe(200);
		// Trimmed, in the chosen casing.
		expect(json.username).toBe("Paulin");
		// The email is never echoed back in the claim response.
		expect(json).not.toHaveProperty("email");
		expect(typeof json.id).toBe("string");
		const { id, ownerToken } = json;
		if (typeof id !== "string" || typeof ownerToken !== "string") {
			throw new Error("claim response is missing id/ownerToken");
		}
		expect(ownerToken.length).toBeGreaterThan(20);

		/**
		 * The DB must hold the SHA-256 hash of the returned token — never the
		 * token itself. The table was cleared in beforeEach, so exactly one token
		 * row exists.
		 */
		const tokens = await runDb(
			Effect.gen(function* () {
				const db = yield* PgDrizzle;
				return yield* db.select().from(ownerTokensTable);
			}),
		);
		expect(tokens).toHaveLength(1);
		const expectedHash = createHash("sha256").update(ownerToken).digest("hex");
		expect(tokens[0]?.tokenHash).toBe(expectedHash);
		expect(tokens[0]?.rankingId).toBe(id);
	});

	// Every input-validation failure: rejected with 422 and a specific code, and
	// (being rejected before persistence) creating no row. One case per row keeps
	// each to a single API call while grouping the whole validation surface.
	test.each([
		[
			"blank email",
			"email_empty",
			{
				email: "",
				username: "valid-name",
			},
		],
		[
			"whitespace email",
			"email_empty",
			{
				email: "   ",
				username: "valid-name",
			},
		],
		[
			"email missing domain",
			"email_invalid",
			{
				email: "foo@",
				username: "valid-name",
			},
		],
		[
			"email longer than 254 chars",
			"email_invalid",
			{
				email: `${"a".repeat(250)}@b.com`,
				username: "valid-name",
			},
		],
		[
			"blank username",
			"username_empty",
			{
				email: "ok@example.com",
				username: "",
			},
		],
		[
			"whitespace username",
			"username_empty",
			{
				email: "ok@example.com",
				username: "   ",
			},
		],
		[
			"trimmed username shorter than 2 chars",
			"username_too_short",
			{
				email: "ok@example.com",
				username: " a ",
			},
		],
		[
			"trimmed username longer than 30 chars",
			"username_too_long",
			{
				email: "ok@example.com",
				username: `  ${"x".repeat(31)}  `,
			},
		],
	])("rejects %s as %s", async (_desc, code, body) => {
		const { handler } = ctx;
		const { status, json } = await claim(handler, body);
		expect(status).toBe(422);
		expect(json.code).toBe(code);
	});

	// Collision is case- and whitespace-insensitive; refused with username_taken
	// (NOT routed to recovery — there is no recovery affordance in the response,
	// only the code). The clashing name is claimed under a different owner email.
	test("rejects a case/whitespace-insensitive duplicate username", async () => {
		const { handler, runDb } = ctx;
		await seedRanking(runDb, {
			email: EXISTING_EMAIL,
			username: EXISTING_USERNAME,
		});

		const { status, json } = await claim(handler, {
			email: "different-owner@example.com",
			username: `  ${EXISTING_USERNAME.toUpperCase()} `,
		});
		expect(status).toBe(422);
		expect(json.code).toBe("username_taken");
	});

	// A claim on an email that already backs a ranking is refused with
	// email_taken — matched ignoring case and surrounding whitespace, without
	// echoing the existing email, and before a second ranking exists.
	test("rejects a case/whitespace-insensitive duplicate email before creating a second ranking", async () => {
		const { handler, runDb } = ctx;
		await seedRanking(runDb, {
			email: EXISTING_EMAIL,
			username: EXISTING_USERNAME,
		});

		const { status, json } = await claim(handler, {
			email: `  ${EXISTING_EMAIL.toUpperCase()}  `,
			username: "email-dup-second",
		});
		expect(status).toBe(422);
		expect(json.code).toBe("email_taken");
		// The refusal never echoes the existing ranking's email.
		expect(json).not.toHaveProperty("email");

		// Refused before a second ranking is created: only the seeded row backs
		// this email.
		const rows = await runDb(
			Effect.gen(function* () {
				const db = yield* PgDrizzle;
				return yield* db
					.select({
						id: rankingsTable.id,
					})
					.from(rankingsTable)
					.where(
						sql`lower(trim(${rankingsTable.email})) = ${EXISTING_EMAIL.toLowerCase()}`,
					);
			}),
		);
		expect(rows).toHaveLength(1);
	});

	// When both email and username already exist, email takes precedence: the
	// duplicate-email refusal (with its recovery path) wins over username_taken.
	test("prefers email_taken over username_taken when both collide", async () => {
		const { handler, runDb } = ctx;
		await seedRanking(runDb, {
			email: EXISTING_EMAIL,
			username: EXISTING_USERNAME,
		});

		const { status, json } = await claim(handler, {
			email: EXISTING_EMAIL,
			username: EXISTING_USERNAME,
		});
		expect(status).toBe(422);
		expect(json.code).toBe("email_taken");
	});
});
