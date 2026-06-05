import { List } from "@boty/shared/schemas/List.schema";
import { Schema } from "effect";
import {
	HttpApiEndpoint,
	HttpApiGroup,
	OpenApi,
} from "effect/unstable/httpapi";

/**
 * Endpoint
 */
const endpoint = "lists" as const;

/**
 * API routes
 */
export const ListsApi = HttpApiGroup.make(endpoint)
	.add(
		HttpApiEndpoint.get("findById", `/${endpoint}/:id`, {
			params: {
				id: Schema.NumberFromString,
			},
			success: List,
		}),
	)
	.annotate(OpenApi.Title, "Lists")
	.annotate(OpenApi.Description, "Manage Lists");
