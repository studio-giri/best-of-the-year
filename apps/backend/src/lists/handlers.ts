import { Api } from "@boty/shared/api/Api";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { claimList } from "./claim/claimList.handler.ts";
import { findListById } from "./find/findListById.handler.ts";
import { saveListItems } from "./items/saveListItems.handler.ts";
import { consumeRecovery } from "./recovery/consumeRecovery.handler.ts";
import { requestRecovery } from "./recovery/requestRecovery.handler.ts";

export const HttpListsLive = HttpApiBuilder.group(Api, "lists", (handlers) =>
	handlers
		.handle("findById", ({ params }) => findListById(params.id))
		.handle("saveItems", ({ params, headers, payload }) =>
			saveListItems({
				listId: params.id,
				authorization: headers.authorization,
				body: payload,
			}),
		)
		.handle("claim", ({ payload }) => claimList(payload))
		.handle("requestRecovery", ({ payload }) => requestRecovery(payload))
		.handle("consumeRecovery", ({ payload }) => consumeRecovery(payload)),
);
