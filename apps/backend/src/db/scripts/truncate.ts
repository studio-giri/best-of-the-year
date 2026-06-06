import { BunRuntime } from "@effect/platform-bun";
import { is, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import { Config, Console, Effect } from "effect";
import { Pool } from "pg";
import * as schema from "../schema";

const program = Effect.gen(function* () {
	/**
	 * Refuse to run in production
	 */
	const nodeEnv = yield* Config.withDefault(
		Config.string("NODE_ENV"),
		"development",
	);
	if (nodeEnv === "production" || nodeEnv === "prod") {
		yield* Effect.fail(new Error("db:truncate cannot be run in production"));
	}

	/**
	 * User confirmation
	 */
	const confirmation = yield* Effect.sync(() =>
		prompt(`Type "truncate" to confirm (ENV=${nodeEnv}):`),
	);
	if (confirmation !== "truncate") {
		yield* Effect.fail(new Error("Truncate cancelled"));
	}

	/**
	 * Connect to PostgreSQL, run the truncate, then release the pool —
	 * the release runs even if the truncate fails.
	 */
	const databaseUrl = yield* Config.string("DATABASE_URL");
	yield* Effect.acquireUseRelease(
		Effect.sync(
			() =>
				new Pool({
					connectionString: databaseUrl,
					idleTimeoutMillis: 0,
				}),
		),
		(pool) => {
			const db = drizzle({
				client: pool,
			});
			return Effect.gen(function* () {
				/**
				 * Terminate other connections so locks don't block the truncate
				 */
				yield* Effect.tryPromise({
					try: () =>
						db.execute(
							sql`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()`,
						),
					catch: (cause) =>
						new Error("Failed to terminate connections", {
							cause,
						}),
				});

				/**
				 * Truncate every table declared in schema.ts in a single statement
				 * Inspired by drizzle-seed's reset(): listing all tables together
				 * satisfies FK constraints between them, CASCADE extends to out-of-schema
				 * referencing tables, and RESTART IDENTITY resets identity/serial sequences.
				 * Enum types are schema, not data — truncation never touches them.
				 */
				const tables = Object.values(schema)
					.filter((value) => is(value, PgTable))
					.map((table) => {
						const config = getTableConfig(table);
						return `"${config.schema ?? "public"}"."${config.name}"`;
					});
				yield* Effect.tryPromise({
					try: () =>
						db.execute(
							sql.raw(`TRUNCATE ${tables.join(", ")} RESTART IDENTITY CASCADE`),
						),
					catch: (cause) =>
						new Error("Failed to truncate database", {
							cause,
						}),
				});

				yield* Console.info("Database truncated successfully");
			});
		},
		(pool) => Effect.promise(() => pool.end()),
	);
});

BunRuntime.runMain(program);
