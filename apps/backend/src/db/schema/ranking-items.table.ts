import { sql } from "drizzle-orm";
import {
	integer,
	snakeCase,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { rankingsTable } from "./rankings.table.ts";

const pgTable = snakeCase.table;

export const rankingItemsTable = pgTable(
	"ranking_items",
	{
		id: uuid().primaryKey().default(sql`uuidv7()`),

		rankingId: uuid()
			.notNull()
			.references(() => rankingsTable.id, {
				onDelete: "cascade",
			}),

		year: integer().notNull(),

		name: varchar({
			length: 255,
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
	},
	(table) => [
		unique().on(table.rankingId, table.year),
	],
);
