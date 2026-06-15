import {
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSchema,
	OpenApi,
} from "effect/unstable/httpapi";
import { Ranking } from "../../schemas/Ranking.schema.ts";
import { Uuid } from "../../schemas/Uuid.schema.ts";
import { RankingNotFound } from "./RankingNotFound.ts";

/**
 * Endpoint
 */
const endpoint = "rankings" as const;

/**
 * API routes
 */
export const RankingsApi = HttpApiGroup.make(endpoint)
	.add(
		HttpApiEndpoint.get("findById", `/${endpoint}/:id`, {
			params: {
				id: Uuid,
			},
			success: Ranking,
			error: HttpApiSchema.status(404)(RankingNotFound),
		}),
	)
	.annotate(OpenApi.Title, "Rankings")
	.annotate(OpenApi.Description, "Manage Rankings");
