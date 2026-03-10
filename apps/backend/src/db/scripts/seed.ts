import { BunRuntime } from "@effect/platform-bun";
import { drizzle } from "drizzle-orm/node-postgres";
import { Config, Console, Effect } from "effect";
import { Pool } from "pg";
import { rankingsTable } from "../schema";
import { ranking1 } from "./seed-values";

const program = Effect.gen(function* () {
	/**
	 * Connect to PostgreSQL, run the reset, then release the pool —
	 * the release runs even if the seed fails.
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
				 * Insert a seed ranking and log its generated id
				 */
				yield* Effect.tryPromise({
					try: () => db.insert(rankingsTable).values(ranking1),
					catch: (cause) =>
						new Error(`Failed to seed ranking: ${String(cause)}`),
				});
				yield* Console.info("Seed successful");
			});
		},
		(pool) => Effect.promise(() => pool.end()),
	);
});

BunRuntime.runMain(program);
