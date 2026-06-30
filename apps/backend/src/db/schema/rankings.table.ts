import {
	MAX_EMAIL_LENGTH,
	MAX_USERNAME_LENGTH,
} from "@boty/shared/api/rankings/claim/claimRules";
import { sql } from "drizzle-orm";
import {
	snakeCase,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// In drizzle v1 the casing is bound to the table builder rather than the db
// instance, so we build every table through `snakeCase.table`.
const pgTable = snakeCase.table;

// Name of the functional unique index guarding username uniqueness. Exported so
// the claim handler matches THIS specific constraint when translating a unique
// violation into the duplicate-username refusal, rather than treating any unique
// violation on the table as a username clash.
export const RANKINGS_USERNAME_UNIQUE_INDEX =
	"rankings_username_lower_trim_unique";

export const rankingsTable = pgTable(
	"rankings",
	{
		id: uuid().primaryKey().default(sql`uuidv7()`),

		// Stored trimmed, in the chosen casing, for public display. Uniqueness is
		// enforced case- and whitespace-insensitively by the functional index
		// below — NOT a plain column UNIQUE, which would be case-sensitive.
		username: varchar({
			length: MAX_USERNAME_LENGTH,
		}).notNull(),

		// Private contact (never returned to clients). The one-per-email UNIQUE
		// and all duplicate-email handling land in S-001-03; for now it is just a
		// required column.
		email: varchar({
			length: MAX_EMAIL_LENGTH,
		}).notNull(),

		createdAt: timestamp({
			mode: "date",
			precision: 3,
		})
			.notNull()
			.defaultNow(),

		updatedAt: timestamp({
			mode: "date",
			precision: 3,
		})
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),

		deletedAt: timestamp({
			mode: "date",
			precision: 3,
		}),
	},
	(table) => [
		// Authoritative uniqueness guard at claim time: the handler inserts and
		// translates a violation here into the duplicate-username refusal, so
		// two concurrent claims of the same name race-free to one success.
		uniqueIndex(RANKINGS_USERNAME_UNIQUE_INDEX).on(
			sql`lower(trim(${table.username}))`,
		),
	],
);
