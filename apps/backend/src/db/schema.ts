import { defineRelations, sql } from "drizzle-orm";
import {
	integer,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const rankingsTable = pgTable("rankings", {
	id: uuid("id").primaryKey().default(sql`uuidv7()`),

	author: varchar({
		length: 30,
	}).notNull(),

	createdAt: timestamp("created_at", {
		mode: "date",
		precision: 3,
	})
		.notNull()
		.defaultNow(),

	updatedAt: timestamp("updated_at", {
		mode: "date",
		precision: 3,
	})
		.notNull()
		.defaultNow(),

	deletedAt: timestamp("deleted_at", {
		mode: "date",
		precision: 3,
	}),
});

export const rankingItemsTable = pgTable(
	"ranking_items",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),

		rankingId: uuid("ranking_id")
			.notNull()
			.references(() => rankingsTable.id, {
				onDelete: "cascade",
			}),

		year: integer("year").notNull(),

		name: varchar("name", {
			length: 255,
		}).notNull(),

		createdAt: timestamp("created_at", {
			mode: "date",
			precision: 3,
		})
			.notNull()
			.defaultNow(),

		updatedAt: timestamp("updated_at", {
			mode: "date",
			precision: 3,
		})
			.notNull()
			.defaultNow(),
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
