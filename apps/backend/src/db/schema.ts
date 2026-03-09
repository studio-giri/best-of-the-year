import { sql } from "drizzle-orm";
import { pgTable, uuid } from "drizzle-orm/pg-core";

export const rankingsTable = pgTable("rankings", {
	id: uuid("id").primaryKey().default(sql`uuidv7()`),
});
