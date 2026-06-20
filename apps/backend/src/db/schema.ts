import { defineRelations, sql } from "drizzle-orm";
import {
	integer,
	snakeCase,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// Column names are derived from camelCase keys via snake_case (createdAt ->
// created_at, rankingId -> ranking_id, ...), so we never spell them out by hand.
// In drizzle v1 the casing is bound to the table builder rather than the db
// instance, so we build every table through `snakeCase.table`.
const pgTable = snakeCase.table;

export const rankingsTable = pgTable("rankings", {
	id: uuid().primaryKey().default(sql`uuidv7()`),

	username: varchar({
		length: 30,
	})
		.notNull()
		.unique(),

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
});

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

export const relations = defineRelations(
	{
		rankingsTable,
		rankingItemsTable,
	},
	({ one, many, rankingItemsTable: rit, rankingsTable: rt }) => ({
		rankingsTable: {
			items: many.rankingItemsTable(),
		},
		rankingItemsTable: {
			ranking: one.rankingsTable({
				from: rit.rankingId,
				to: rt.id,
			}),
		},
	}),
);
