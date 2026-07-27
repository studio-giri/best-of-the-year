import type { listItemsTable } from "../schema/list-items.table.ts";
import type { listsTable } from "../schema/lists.table.ts";

const LIST_1_ID = "019d6984-10ef-787c-926f-a7e02b5ca80a";

export const lists: (typeof listsTable.$inferInsert)[] = [
	{
		id: LIST_1_ID,
		username: "User 1",
		email: "user1@email.test",
	},
];

export const listItems: (typeof listItemsTable.$inferInsert)[] = [
	{
		listId: LIST_1_ID,
		year: 2023,
		name: "Baldur's Gate 3",
	},
	{
		listId: LIST_1_ID,
		year: 2022,
		name: "Elden Ring",
	},
	{
		listId: LIST_1_ID,
		year: 2021,
		name: "It Takes Two",
	},
	{
		listId: LIST_1_ID,
		year: 2020,
		name: "The Last of Us Part II",
	},
	{
		listId: LIST_1_ID,
		year: 2019,
		name: "Sekiro: Shadows Die Twice",
	},
];
