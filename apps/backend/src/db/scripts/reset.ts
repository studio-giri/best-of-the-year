import { BunRuntime } from "@effect/platform-bun";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset } from "drizzle-seed";
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
		yield* Effect.fail(new Error("db:reset cannot be run in production"));
	}

	/**
	 * User confirmation
	 */
	const confirmation = yield* Effect.sync(() =>
		prompt(`Type "reset" to confirm (ENV=${nodeEnv}):`),
	);
	if (confirmation !== "reset") {
		yield* Effect.fail(new Error("Reset cancelled"));
	}

	/**
	 * Connect to PostgreSQL, run the reset, then release the pool —
	 * the release runs even if the reset fails.
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
			const db = drizzle(pool);
			return Effect.gen(function* () {
				/**
				 * Terminate other connections so locks don't block the reset
				 */
				yield* Effect.tryPromise({
					try: () =>
						db.execute(
							sql`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()`,
						),
					catch: (cause) =>
						new Error(`Failed to terminate connections: ${String(cause)}`),
				});

				/**
				 * Reset all tables defined in the schema
				 */
				yield* Effect.tryPromise({
					try: () => reset(db, schema),
					catch: (cause) =>
						new Error(`Failed to reset database: ${String(cause)}`),
				});

				yield* Console.info("Database reset successful");
			});
		},
		(pool) => Effect.promise(() => pool.end()),
	);
});

BunRuntime.runMain(program);
