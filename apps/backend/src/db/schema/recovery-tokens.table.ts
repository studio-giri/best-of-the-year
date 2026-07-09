import { sql } from "drizzle-orm";
import { snakeCase, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { rankingsTable } from "./rankings.table.ts";

const pgTable = snakeCase.table;

/**
 * Recovery links (ADR-001): a single-use, 48h-expiry credential that bootstraps
 * a fresh Owner token for the requesting browser. Kept separate from
 * `owner_tokens` because the lifecycles differ — an Owner token is long-lived
 * with no expiry/consumption, a recovery link carries `expiresAt` + `consumedAt`
 * and is spent once. Many-to-one against rankings (cascade) so a ranking can
 * have several concurrent outstanding links. Only the SHA-256 hash is stored.
 */
export const recoveryTokensTable = pgTable("recovery_tokens", {
	id: uuid().primaryKey().default(sql`uuidv7()`),

	rankingId: uuid()
		.notNull()
		.references(() => rankingsTable.id, {
			onDelete: "cascade",
		}),

	tokenHash: text().notNull().unique(),

	// When the link stops being valid. Issuing sets this to now + 48h; expiry
	// enforcement itself is a later story — this Story only records it.
	expiresAt: timestamp({
		mode: "date",
		precision: 3,
	}).notNull(),

	// Null until the link is spent. Single-use enforcement is a later story;
	// issuing always leaves this null.
	consumedAt: timestamp({
		mode: "date",
		precision: 3,
	}),

	createdAt: timestamp({
		mode: "date",
		precision: 3,
	})
		.notNull()
		.defaultNow(),
});
