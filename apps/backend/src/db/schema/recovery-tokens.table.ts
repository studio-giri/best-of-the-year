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

	// Expiry timestamp, set at issuance to now + 48h (ADR-001).
	expiresAt: timestamp({
		mode: "date",
		precision: 3,
	}).notNull(),

	// Timestamp the link was consumed; null means unconsumed.
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
