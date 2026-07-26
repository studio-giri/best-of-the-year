import type { SaveRankingItemsBody } from "@boty/shared/api/rankings/items/SaveRankingItemsBody.schema";
import type { Ranking } from "@boty/shared/api/rankings/Ranking.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Effect } from "effect";
import { client } from "#/lib/api/client.ts";
import { rankingQueryOptions } from "#/lib/api/rankingQueryOptions.ts";
import { getOwnerToken } from "#/lib/ownerTokens.ts";

/**
 * Commit a Ranking's whole list of Items. The Effect runtime stays confined here:
 * the typed client call is run to a Promise, and a refusal rejects it so the
 * editor can say so.
 *
 * The credential is read at commit time rather than at mount, so a browser that
 * gained access mid-pass commits with it. A browser holding none sends an empty
 * one and is refused by the server, which is the only place that can say whether
 * a credential grants anything.
 */
function commitItems(
	rankingId: string,
	items: SaveRankingItemsBody["items"],
): Promise<Ranking> {
	return Effect.runPromise(
		client.rankings.saveItems({
			params: {
				id: rankingId,
			},
			headers: {
				authorization: `Bearer ${getOwnerToken(rankingId) ?? ""}`,
			},
			payload: {
				items,
			},
		}),
	);
}

export function useSaveRankingItems(rankingId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (items: SaveRankingItemsBody["items"]) =>
			commitItems(rankingId, items),
		// The answer is the stored Ranking, so it is seeded into the cache every view
		// of this Ranking reads from — a refetch would only fetch back what is
		// already in hand.
		onSuccess: (saved) => {
			queryClient.setQueryData(rankingQueryOptions(rankingId).queryKey, saved);
		},
	});
}
