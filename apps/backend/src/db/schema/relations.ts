import { defineRelations } from "drizzle-orm";
import { ownerTokensTable } from "./owner-tokens.table.ts";
import { rankingItemsTable } from "./ranking-items.table.ts";
import { rankingsTable } from "./rankings.table.ts";

export const relations = defineRelations(
	{
		rankingsTable,
		rankingItemsTable,
		ownerTokensTable,
	},
	({
		one,
		many,
		rankingItemsTable: rit,
		rankingsTable: rt,
		ownerTokensTable: et,
	}) => ({
		rankingsTable: {
			items: many.rankingItemsTable(),
			ownerTokens: many.ownerTokensTable(),
		},
		rankingItemsTable: {
			ranking: one.rankingsTable({
				from: rit.rankingId,
				to: rt.id,
			}),
		},
		ownerTokensTable: {
			ranking: one.rankingsTable({
				from: et.rankingId,
				to: rt.id,
			}),
		},
	}),
);
