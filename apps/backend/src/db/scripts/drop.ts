import { BunRuntime } from "@effect/platform-bun";
import { sql } from "drizzle-orm";
import { Console, Effect } from "effect";
import { PgDrizzle } from "../PgDrizzle";
import { runDbScript } from "./run-db-script";

const program = runDbScript(
	{
		name: "db:drop",
		confirmWord: "drop",
	},
	Effect.gen(function* () {
		const db = yield* PgDrizzle;

		/**
		 * Drop the whole structure, not just the data:
		 * - `public` holds every table, enum and sequence
		 * - `drizzle` holds the migration journal (__drizzle_migrations) — it
		 *   must die with the tables, otherwise `db:migration:run` would
		 *   consider everything applied and no-op against an empty database
		 * `IF EXISTS` keeps the script idempotent (re-runnable on an already
		 * dropped database). The recreated `public` schema is owned by the
		 * connecting user, which is also the user the app connects as.
		 *
		 * Each statement runs as its own execute so the underlying driver never
		 * has to parse multiple commands in one query.
		 */
		yield* db.execute(sql.raw("DROP SCHEMA IF EXISTS public CASCADE"));
		yield* db.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE"));
		yield* db.execute(sql.raw("CREATE SCHEMA public"));

		yield* Console.info("Database dropped successfully");
	}),
);

BunRuntime.runMain(program);
