import { BunRuntime } from "@effect/platform-bun";
import { is, sql } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import { Console, Effect } from "effect";
import * as schema from "../schema";
import { runDbScript } from "./run-db-script";

const program = runDbScript(
	{
		name: "db:truncate",
		confirmWord: "truncate",
	},
	(db) =>
		Effect.gen(function* () {
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
		}),
);

BunRuntime.runMain(program);
