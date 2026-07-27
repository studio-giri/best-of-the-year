import type { SaveListItemsBody } from "@boty/shared/api/lists/items/SaveListItemsBody.schema";
import type { List } from "@boty/shared/api/lists/List.schema";
import { Effect } from "effect";
import { client } from "./client.ts";

/**
 * Commit a List's whole list of Items and answer with the stored List.
 *
 * The owner token is passed in rather than read here: only the server can say
 * whether a credential grants anything, so an empty one is sent as-is and
 * refused there.
 */
export function saveListItems(
	listId: string,
	items: SaveListItemsBody["items"],
	ownerToken: string,
): Promise<List> {
	return Effect.runPromise(
		client.lists.saveItems({
			params: {
				id: listId,
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
