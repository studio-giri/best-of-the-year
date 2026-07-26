import type { SaveRankingItemsBody } from "@boty/shared/api/rankings/items/SaveRankingItemsBody.schema";
import type { Ranking } from "@boty/shared/api/rankings/Ranking.schema";

/**
 * A whole Ranking as the editor holds it: one game name per year, keyed by year.
 * A year missing from the record — or holding an empty name — has no game.
 *
 * A Ranking holds at most one game per year, so a record keyed by year is the
 * shape that cannot express an invalid one.
 */
export interface RankingItems {
	[year: number]: string;
}

/**
 * A fetched Ranking reshaped into what the editor holds. Item ids and their order
 * carry no meaning here: within a Ranking, the year is the identity.
 */
export function toRankingItems(items: Ranking["items"]): RankingItems {
	return Object.fromEntries(
		items.map((item) => [
			item.year,
			item.name,
		]),
	);
}

/**
 * The end state a commit carries: every year the editor holds a name for, newest
 * first, so a request reads in the same order as the list it came from. A year
 * whose name is empty is left out — it is a year holding no game, which is how a
 * whole-list write removes one.
 */
export function toSaveItems(
	rankingItems: RankingItems,
): SaveRankingItemsBody["items"] {
	return Object.entries(rankingItems)
		.map(([year, name]) => ({
			year: Number(year),
			name,
		}))
		.filter((item) => item.name !== "")
		.sort((a, b) => b.year - a.year);
}
