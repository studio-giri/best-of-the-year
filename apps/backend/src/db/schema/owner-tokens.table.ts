import { sql } from "drizzle-orm";
import { snakeCase, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { rankingsTable } from "./rankings.table.ts";

const pgTable = snakeCase.table;

/**
 * Bearer Owner tokens (ADR-001): many-to-one against rankings so a ranking can
 * have several concurrent tokens (one per browser). Only the SHA-256 hash is
 * stored — a DB read can never recover a usable token.
 */
export const ownerTokensTable = pgTable("owner_tokens", {
	id: uuid().primaryKey().default(sql`uuidv7()`),

	rankingId: uuid()
		.notNull()
		.references(() => rankingsTable.id, {
			onDelete: "cascade",
		}),

	tokenHash: text().notNull().unique(),

	createdAt: timestamp({
		mode: "date",
		precision: 3,
	})
		.notNull()
		.defaultNow(),
});
