import { BunRuntime } from "@effect/platform-bun";
import { drizzle } from "drizzle-orm/node-postgres";
import { Config, Console, Effect } from "effect";
import { Pool } from "pg";
import { rankingsTable } from "../schema.js";

const program = Effect.gen(function* () {
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
	 * Insert a seed ranking and log its generated id
	 */
	yield* Effect.tryPromise({
		try: () => db.insert(rankingsTable).values({}),
		catch: (cause) => new Error(`Failed to seed ranking: ${String(cause)}`),
	});
	yield* Console.info(`Seed successful`);

	/**
	 * Release the connection pool before exiting
	 */
	yield* Effect.tryPromise({
		try: () => pool.end(),
		catch: (cause) => new Error(`Failed to close pool: ${String(cause)}`),
	});
});

BunRuntime.runMain(program);
