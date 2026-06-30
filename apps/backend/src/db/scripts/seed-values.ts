import type { rankingItemsTable } from "../schema/ranking-items.table.ts";
import type { rankingsTable } from "../schema/rankings.table.ts";

const RANKING_1_ID = "019d6984-10ef-787c-926f-a7e02b5ca80a";

export const rankings: (typeof rankingsTable.$inferInsert)[] = [
	{
		id: RANKING_1_ID,
		username: "User 1",
		email: "user1@email.test",
	},
];

export const rankingItems: (typeof rankingItemsTable.$inferInsert)[] = [
	{
		rankingId: RANKING_1_ID,
		year: 2023,
		name: "Baldur's Gate 3",
	},
	{
		rankingId: RANKING_1_ID,
		year: 2022,
		name: "Elden Ring",
	},
	{
		rankingId: RANKING_1_ID,
		year: 2021,
		name: "It Takes Two",
	},
	{
		rankingId: RANKING_1_ID,
		year: 2020,
		name: "The Last of Us Part II",
	},
	{
		rankingId: RANKING_1_ID,
		year: 2019,
		name: "Sekiro: Shadows Die Twice",
	},
];
