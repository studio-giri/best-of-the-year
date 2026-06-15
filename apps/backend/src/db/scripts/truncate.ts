import { BunRuntime } from "@effect/platform-bun";
import { is, sql } from "drizzle-orm";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import { Console, Effect } from "effect";
import { PgDrizzle } from "../PgDrizzle.ts";
import * as schema from "../schema.ts";
import { runDbScript } from "./run-db-script.ts";

const program = runDbScript(
	{
		name: "db:truncate",
		confirmWord: "truncate",
	},
	Effect.gen(function* () {
		const db = yield* PgDrizzle;

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
		yield* db.execute(
			sql.raw(`TRUNCATE ${tables.join(", ")} RESTART IDENTITY CASCADE`),
		);

		yield* Console.info("Database truncated successfully");
	}),
);

BunRuntime.runMain(program);
