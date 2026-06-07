import { BunRuntime } from "@effect/platform-bun";
import { sql } from "drizzle-orm";
import { Console, Effect } from "effect";
import { runDbScript } from "./run-db-script";

const program = runDbScript(
	{
		name: "db:drop",
		confirmWord: "drop",
	},
	(db) =>
		Effect.gen(function* () {
			/**
			 * Drop the whole structure, not just the data:
			 * - `public` holds every table, enum and sequence
			 * - `drizzle` holds the migration journal (__drizzle_migrations) — it
			 *   must die with the tables, otherwise `db:migration:run` would
			 *   consider everything applied and no-op against an empty database
			 * `IF EXISTS` keeps the script idempotent (re-runnable on an already
			 * dropped database). The recreated `public` schema is owned by the
			 * connecting user, which is also the user the app connects as.
			 */
			yield* Effect.tryPromise({
				try: () =>
					db.execute(
						sql.raw(
							`DROP SCHEMA IF EXISTS public CASCADE;
							DROP SCHEMA IF EXISTS drizzle CASCADE;
							CREATE SCHEMA public;`,
						),
					),
				catch: (cause) =>
					new Error("Failed to drop database schema", {
						cause,
					}),
			});

			yield* Console.info("Database dropped successfully");
		}),
);

BunRuntime.runMain(program);
