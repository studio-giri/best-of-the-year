import type { SaveRankingItemsBody } from "@boty/shared/api/rankings/items/SaveRankingItemsBody.schema";
import type { Ranking } from "@boty/shared/api/rankings/Ranking.schema";
import { Effect } from "effect";
import { client } from "./client.ts";

/**
 * Commit a Ranking's whole list of Items and answer with the stored Ranking.
 *
 * The owner token is passed in rather than read here: only the server can say
 * whether a credential grants anything, so an empty one is sent as-is and
 * refused there.
 */
export function saveRankingItems(
	rankingId: string,
	items: SaveRankingItemsBody["items"],
	ownerToken: string,
): Promise<Ranking> {
	return Effect.runPromise(
		client.rankings.saveItems({
			params: {
				id: rankingId,
			},
			headers: {
				authorization: `Bearer ${ownerToken}`,
			},
			payload: {
				items,
			},
		}),
	);
}
