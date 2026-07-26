import { Schema } from "effect";
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
import { EditAccessDenied } from "./EditAccessDenied.error.ts";
import { RankingWouldBeEmpty } from "./items/RankingWouldBeEmpty.error.ts";
import { SaveRankingItemsBody } from "./items/SaveRankingItemsBody.schema.ts";
import { YearNotCovered } from "./items/YearNotCovered.error.ts";
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
		/**
		 * Replace a Ranking's whole list of Items in one write (ADR-003). Edit
		 * access is resource-scoped — it is the right to edit *this* Ranking — so
		 * the credential is declared here on the endpoint rather than carried by
		 * middleware, which would have no path param to scope itself by. The
		 * answer is the stored Ranking, so a client's next write starts from what
		 * this one left behind.
		 */
		HttpApiEndpoint.put("saveItems", `/${endpoint}/:id/items`, {
			params: {
				id: Uuid,
			},
			headers: {
				authorization: Schema.optional(Schema.String),
			},
			payload: SaveRankingItemsBody,
			success: Ranking,
			error: [
				HttpApiSchema.status(404)(RankingNotFound),
				HttpApiSchema.status(401)(EditAccessDenied),
				HttpApiSchema.status(422)(YearNotCovered),
				HttpApiSchema.status(422)(RankingWouldBeEmpty),
			],
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
