import { sql } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
