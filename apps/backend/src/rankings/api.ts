import { Ranking } from "@boty/shared/schemas/Ranking.schema";
import { Schema } from "effect";
import {
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSchema,
	OpenApi,
} from "effect/unstable/httpapi";
import { RankingNotFound } from "./errors.ts";

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
				id: Schema.String,
			},
			success: Ranking,
			error: HttpApiSchema.status(404)(RankingNotFound),
		}),
	)
	.annotate(OpenApi.Title, "Rankings")
	.annotate(OpenApi.Description, "Manage Rankings");
