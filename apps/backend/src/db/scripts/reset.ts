import { BunRuntime } from "@effect/platform-bun";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset } from "drizzle-seed";
import { Config, Console, Effect } from "effect";
import { Pool } from "pg";
import * as schema from "../schema.js";

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
	 * Connect to PostgreSQL and create a Drizzle client
	 */
	const databaseUrl = yield* Config.string("DATABASE_URL");
	const pool = new Pool({
		connectionString: databaseUrl,
		idleTimeoutMillis: 0,
	});
	const db = drizzle(pool);

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
		catch: (cause) => new Error(`Failed to reset database: ${String(cause)}`),
	});
	yield* Console.info("Database reset successful");

	/**
	 * Release the connection pool before exiting
	 */
	yield* Effect.tryPromise({
		try: () => pool.end(),
		catch: (cause) => new Error(`Failed to close pool: ${String(cause)}`),
	});
});

BunRuntime.runMain(program);
