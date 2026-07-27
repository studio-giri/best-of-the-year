import { MAX_ITEM_NAME_LENGTH } from "@boty/shared/api/lists/items/listItemRules";
import { sql } from "drizzle-orm";
import {
	integer,
	snakeCase,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { listsTable } from "./lists.table.ts";

const pgTable = snakeCase.table;

export const listItemsTable = pgTable(
	"list_items",
	{
		id: uuid().primaryKey().default(sql`uuidv7()`),

		listId: uuid()
			.notNull()
			.references(() => listsTable.id, {
				onDelete: "cascade",
			}),

		year: integer().notNull(),

		name: varchar({
			length: MAX_ITEM_NAME_LENGTH,
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
		unique().on(table.listId, table.year),
	],
);
