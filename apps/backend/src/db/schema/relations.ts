import { defineRelations } from "drizzle-orm";
import { ownerTokensTable } from "./owner-tokens.table.ts";
import { rankingItemsTable } from "./ranking-items.table.ts";
import { rankingsTable } from "./rankings.table.ts";
import { recoveryTokensTable } from "./recovery-tokens.table.ts";

export const relations = defineRelations(
	{
		rankingsTable,
		rankingItemsTable,
		ownerTokensTable,
		recoveryTokensTable,
	},
	({
		one,
		many,
		rankingItemsTable: rit,
		rankingsTable: rt,
		ownerTokensTable: et,
		recoveryTokensTable: rct,
	}) => ({
		rankingsTable: {
			items: many.rankingItemsTable(),
			ownerTokens: many.ownerTokensTable(),
			recoveryTokens: many.recoveryTokensTable(),
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
		recoveryTokensTable: {
			ranking: one.rankingsTable({
				from: rct.rankingId,
				to: rt.id,
			}),
		},
	}),
);
