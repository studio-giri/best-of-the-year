import { sql } from "drizzle-orm";
import { snakeCase, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { listsTable } from "./lists.table.ts";

const pgTable = snakeCase.table;

/**
 * Bearer Owner tokens (ADR-001): many-to-one against lists so a list can
 * have several concurrent tokens (one per browser). Only the SHA-256 hash is
 * stored — a DB read can never recover a usable token.
 */
export const ownerTokensTable = pgTable("owner_tokens", {
	id: uuid().primaryKey().default(sql`uuidv7()`),

	listId: uuid()
		.notNull()
		.references(() => listsTable.id, {
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
