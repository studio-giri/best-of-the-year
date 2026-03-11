import { Ranking } from "@boty/shared/schemas/Ranking.schema";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform";
import { Schema } from "effect";
import { RankingNotFound } from "./errors.ts";

/**
 * Endpoint
 */
const endpoint = "rankings" as const;

/**
 * API routes
 */
export class RankingsApi extends HttpApiGroup.make(endpoint)
	.prefix(`/${endpoint}`)
	.add(
		HttpApiEndpoint.get("findById", `/${endpoint}/:id`)
			.setPath(
				Schema.Struct({
					id: Schema.String,
				}),
			)
			.addSuccess(Ranking)
			.addError(RankingNotFound, {
				status: 404,
			}),
	)
	.annotate(OpenApi.Title, "Rankings")
	.annotate(OpenApi.Description, "Manage Rankings") {}
