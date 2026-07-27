import { defineRelations } from "drizzle-orm";
import { listItemsTable } from "./list-items.table.ts";
import { listsTable } from "./lists.table.ts";
import { ownerTokensTable } from "./owner-tokens.table.ts";
import { recoveryTokensTable } from "./recovery-tokens.table.ts";

export const relations = defineRelations(
	{
		listsTable,
		listItemsTable,
		ownerTokensTable,
		recoveryTokensTable,
	},
	({
		one,
		many,
		listItemsTable: rit,
		listsTable: rt,
		ownerTokensTable: et,
		recoveryTokensTable: rct,
	}) => ({
		listsTable: {
			items: many.listItemsTable(),
			ownerTokens: many.ownerTokensTable(),
			recoveryTokens: many.recoveryTokensTable(),
		},
		listItemsTable: {
			list: one.listsTable({
				from: rit.listId,
				to: rt.id,
			}),
		},
		ownerTokensTable: {
			list: one.listsTable({
				from: et.listId,
				to: rt.id,
			}),
		},
		recoveryTokensTable: {
			list: one.listsTable({
				from: rct.listId,
				to: rt.id,
			}),
		},
	}),
);
