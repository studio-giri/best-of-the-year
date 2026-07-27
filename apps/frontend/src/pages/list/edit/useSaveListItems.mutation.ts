import type { SaveListItemsBody } from "@boty/shared/api/lists/items/SaveListItemsBody.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listQueryOptions } from "#/lib/api/listQueryOptions.ts";
import { saveListItems } from "#/lib/api/saveListItems.ts";
import { getOwnerToken } from "#/lib/ownerTokens.ts";

export function useSaveListItems(listId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		// Read the credential at commit time, not at mount, so a browser that gained
		// access mid-pass commits with it.
		mutationFn: (items: SaveListItemsBody["items"]) =>
			saveListItems(listId, items, getOwnerToken(listId) ?? ""),
		// The answer is the stored List, so it is seeded into the cache every view
		// of this List reads from — a refetch would only fetch back what is
		// already in hand.
		onSuccess: (saved) => {
			queryClient.setQueryData(listQueryOptions(listId).queryKey, saved);
		},
	});
}
