import { BunRuntime } from "@effect/platform-bun";
import { sql } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { Console, Effect } from "effect";
import { PgDrizzle } from "../PgDrizzle.ts";
import { ownerTokensTable } from "../schema/owner-tokens.table.ts";
import { rankingItemsTable } from "../schema/ranking-items.table.ts";
import { rankingsTable } from "../schema/rankings.table.ts";
import { runDbScript } from "./run-db-script.ts";

const program = runDbScript(
	{
		name: "db:truncate",
		confirmWord: "truncate",
	},
	Effect.gen(function* () {
		const db = yield* PgDrizzle;

		/**
		 * Listing all tables together satisfies FK constraints between them,
		 * CASCADE extends to out-of-schema referencing tables, and RESTART IDENTITY
		 * resets identity/serial sequences. Enum types are schema, not data —
		 * truncation never touches them.
		 */
		const tables = [
			rankingsTable,
			ownerTokensTable,
			rankingItemsTable,
		].map((table) => {
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
