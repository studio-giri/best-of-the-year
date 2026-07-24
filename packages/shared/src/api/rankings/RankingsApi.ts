import {
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSchema,
	OpenApi,
} from "effect/unstable/httpapi";
import { Uuid } from "../primitives/Uuid.schema.ts";
import { ClaimRankingBody } from "./claim/ClaimRankingBody.schema.ts";
import { ClaimRankingResponse } from "./claim/ClaimRankingResponse.schema.ts";
import { ClaimRejected } from "./claim/ClaimRejected.error.ts";
import { Ranking } from "./Ranking.schema.ts";
import { RankingNotFound } from "./RankingNotFound.error.ts";
import { ConsumeRecoveryBody } from "./recover/consume/ConsumeRecoveryBody.schema.ts";
import { ConsumeRecoveryResponse } from "./recover/consume/ConsumeRecoveryResponse.schema.ts";
import { RecoveryLinkRejected } from "./recover/consume/RecoveryLinkRejected.error.ts";
import { RecoveryRejected } from "./recover/RecoveryRejected.error.ts";
import { RequestRecoveryBody } from "./recover/RequestRecoveryBody.schema.ts";
import { RequestRecoveryResponse } from "./recover/RequestRecoveryResponse.schema.ts";

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
	.add(
		HttpApiEndpoint.post("claim", `/${endpoint}`, {
			payload: ClaimRankingBody,
			success: ClaimRankingResponse,
			error: HttpApiSchema.status(422)(ClaimRejected),
		}),
	)
	.add(
		HttpApiEndpoint.post("requestRecovery", "/recover/request", {
			payload: RequestRecoveryBody,
			success: RequestRecoveryResponse,
			error: HttpApiSchema.status(422)(RecoveryRejected),
		}),
	)
	.add(
		HttpApiEndpoint.post("consumeRecovery", "/recover/consume", {
			payload: ConsumeRecoveryBody,
			success: ConsumeRecoveryResponse,
			error: HttpApiSchema.status(422)(RecoveryLinkRejected),
		}),
	)
	.annotate(OpenApi.Title, "Rankings")
	.annotate(OpenApi.Description, "Manage Rankings");
