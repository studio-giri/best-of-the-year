import { List } from "@boty/shared/schemas/List.schema";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Schema } from "effect";

/**
 * Endpoint
 */
const endpoint = "lists" as const;

/**
 * API routes
 */
export class ListsApi extends HttpApiGroup.make(endpoint)
	.prefix(`/${endpoint}`)
	.add(
		HttpApiEndpoint.get("findById", `/${endpoint}/:id`)
			.setPath(Schema.Struct({ id: Schema.NumberFromString }))
			.addSuccess(List),
	)
	.annotate(OpenApi.Title, "Lists")
	.annotate(OpenApi.Description, "Manage Lists") {}
