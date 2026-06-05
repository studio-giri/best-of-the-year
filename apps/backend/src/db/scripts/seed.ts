import { BunRuntime } from "@effect/platform-bun";
import { drizzle } from "drizzle-orm/node-postgres";
import { Config, Console, Effect } from "effect";
import { Pool } from "pg";
import { rankingItemsTable, rankingsTable } from "../schema";
import { rankingItems, rankings } from "./seed-values";

const program = Effect.gen(function* () {
	/**
	 * Connect to PostgreSQL, run the seed, then release the pool —
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
			const db = drizzle({
				client: pool,
			});
			return Effect.gen(function* () {
				/**
				 * Insert seed rankings and their items
				 */
				yield* Effect.tryPromise({
					try: () => db.insert(rankingsTable).values(rankings),
					catch: (cause) =>
						new Error(`Failed to seed rankings: ${String(cause)}`),
				});
				yield* Effect.tryPromise({
					try: () => db.insert(rankingItemsTable).values(rankingItems),
					catch: (cause) =>
						new Error(`Failed to seed ranking items: ${String(cause)}`),
				});
				yield* Console.info("Seed successful");
			});
		},
		(pool) => Effect.promise(() => pool.end()),
	);
});

BunRuntime.runMain(program);
