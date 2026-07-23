import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { Effect } from "effect";
import { PgDrizzle } from "../../src/db/PgDrizzle.ts";
import { ownerTokensTable } from "../../src/db/schema/owner-tokens.table.ts";
import { rankingsTable } from "../../src/db/schema/rankings.table.ts";
import { makeTestCtx } from "../setup/make-test-ctx.ts";

type Handler = Awaited<ReturnType<typeof makeTestCtx>>["handler"];

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

describe("POST /rankings (claim)", () => {
	let ctx: Awaited<ReturnType<typeof makeTestCtx>>;

	beforeAll(async () => {
		ctx = await makeTestCtx();
	});

	afterAll(async () => {
		await ctx?.cleanup();
	});

	// A valid email + unused username creates the ranking and returns the
	// owner credentials; a token row exists holding only the hash.
	test("creates a ranking and stores only the token hash", async () => {
		const { handler, runDb } = ctx;

		const { status, json } = await claim(handler, {
			email: "claimer@example.com",
			username: "uniquely-mine",
		});

		expect(status).toBe(200);
		expect(json.username).toBe("uniquely-mine");
		expect(typeof json.id).toBe("string");
		const { id, ownerToken } = json;
		if (typeof id !== "string" || typeof ownerToken !== "string") {
			throw new Error("claim response is missing id/ownerToken");
		}
		expect(ownerToken.length).toBeGreaterThan(20);

		/**
		 * The DB must hold the SHA-256 hash of the returned token — never the
		 * token itself.
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

	// Username is stored & returned trimmed, in the chosen casing.
	test("stores and returns the username trimmed in chosen casing", async () => {
		const { handler } = ctx;
		const { status, json } = await claim(handler, {
			email: "casing@example.com",
			username: "  Paulin ",
		});
		expect(status).toBe(200);
		expect(json.username).toBe("Paulin");
	});

	// Email is never present in the claim response.
	test("never includes email in the claim response", async () => {
		const { handler } = ctx;
		const { json } = await claim(handler, {
			email: "private@example.com",
			username: "no-email-leak",
		});
		expect(json).not.toHaveProperty("email");
	});

	// Blank / whitespace-only email.
	test.each([
		[
			"",
			"blank email",
		],
		[
			"   ",
			"whitespace email",
		],
	])("rejects %p as email_empty (%s)", async (email) => {
		const { handler } = ctx;
		const { status, json } = await claim(handler, {
			email,
			username: "valid-name",
		});
		expect(status).toBe(422);
		expect(json.code).toBe("email_empty");
	});

	// Syntactically invalid email, and one longer than 254 chars.
	test.each([
		[
			"foo@",
			"missing domain",
		],
		[
			`${"a".repeat(250)}@b.com`,
			"longer than 254 chars",
		],
	])("rejects %p as email_invalid (%s)", async (email) => {
		const { handler } = ctx;
		const { status, json } = await claim(handler, {
			email,
			username: "valid-name-2",
		});
		expect(status).toBe(422);
		expect(json.code).toBe("email_invalid");
	});

	// Blank / whitespace-only username.
	test.each([
		[
			"",
			"blank username",
		],
		[
			"   ",
			"whitespace username",
		],
	])("rejects %p as username_empty (%s)", async (username) => {
		const { handler } = ctx;
		const { status, json } = await claim(handler, {
			email: "ok@example.com",
			username,
		});
		expect(status).toBe(422);
		expect(json.code).toBe("username_empty");
	});

	// Trimmed length < 2.
	test("rejects a trimmed username shorter than 2 chars", async () => {
		const { handler } = ctx;
		const { status, json } = await claim(handler, {
			email: "ok@example.com",
			username: " a ",
		});
		expect(status).toBe(422);
		expect(json.code).toBe("username_too_short");
	});

	// Trimmed length > 30.
	test("rejects a trimmed username longer than 30 chars", async () => {
		const { handler } = ctx;
		const { status, json } = await claim(handler, {
			email: "ok@example.com",
			username: `  ${"x".repeat(31)}  `,
		});
		expect(status).toBe(422);
		expect(json.code).toBe("username_too_long");
	});

	// Collision is case- and whitespace-insensitive; refused with
	// username_taken (NOT routed to recovery — there is no recovery affordance
	// in the response, only the code).
	test("rejects a case/whitespace-insensitive duplicate username", async () => {
		const { handler } = ctx;

		const first = await claim(handler, {
			email: "first@example.com",
			username: "collider",
		});
		expect(first.status).toBe(200);

		const second = await claim(handler, {
			email: "second@example.com",
			username: "  CoLLiDeR ",
		});
		expect(second.status).toBe(422);
		expect(second.json.code).toBe("username_taken");
	});

	// A second claim on an email that already backs a ranking is refused with
	// email_taken — matched ignoring case and surrounding whitespace, before a
	// second ranking exists, and without echoing the existing email.
	test("rejects a case/whitespace-insensitive duplicate email before creating a second ranking", async () => {
		const { handler, runDb } = ctx;

		const email = "duplicate@example.com";
		const first = await claim(handler, {
			email,
			username: "email-dup-first",
		});
		expect(first.status).toBe(200);

		const second = await claim(handler, {
			email: `  ${email.toUpperCase()}  `,
			username: "email-dup-second",
		});
		expect(second.status).toBe(422);
		expect(second.json.code).toBe("email_taken");
		// The refusal never echoes the existing ranking's email.
		expect(second.json).not.toHaveProperty("email");

		// Refused before a second ranking is created: only the first row backs
		// this email (the suite shares one schema, so scope the count to it).
		const rows = await runDb(
			Effect.gen(function* () {
				const db = yield* PgDrizzle;
				return yield* db
					.select({
						id: rankingsTable.id,
					})
					.from(rankingsTable)
					.where(
						sql`lower(trim(${rankingsTable.email})) = ${email.toLowerCase()}`,
					);
			}),
		);
		expect(rows).toHaveLength(1);
	});

	// When both email and username already exist, email takes precedence: the
	// duplicate-email refusal (with its recovery path) wins over username_taken.
	test("prefers email_taken over username_taken when both collide", async () => {
		const { handler } = ctx;

		const first = await claim(handler, {
			email: "both-collide@example.com",
			username: "both-collide",
		});
		expect(first.status).toBe(200);

		const second = await claim(handler, {
			email: "both-collide@example.com",
			username: "both-collide",
		});
		expect(second.status).toBe(422);
		expect(second.json.code).toBe("email_taken");
	});
});
