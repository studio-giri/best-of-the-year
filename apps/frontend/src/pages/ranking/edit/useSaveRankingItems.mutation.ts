import type { SaveRankingItemsBody } from "@boty/shared/api/rankings/items/SaveRankingItemsBody.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rankingQueryOptions } from "#/lib/api/rankingQueryOptions.ts";
import { saveRankingItems } from "#/lib/api/saveRankingItems.ts";
import { getOwnerToken } from "#/lib/ownerTokens.ts";

export function useSaveRankingItems(rankingId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		// Read the credential at commit time, not at mount, so a browser that gained
		// access mid-pass commits with it.
		mutationFn: (items: SaveRankingItemsBody["items"]) =>
			saveRankingItems(rankingId, items, getOwnerToken(rankingId) ?? ""),
		// The answer is the stored Ranking, so it is seeded into the cache every view
		// of this Ranking reads from — a refetch would only fetch back what is
		// already in hand.
		onSuccess: (saved) => {
			queryClient.setQueryData(rankingQueryOptions(rankingId).queryKey, saved);
		},
	});
}
