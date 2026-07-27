import { Schema } from "effect";
import {
	HttpApiEndpoint,
	HttpApiGroup,
	HttpApiSchema,
	OpenApi,
} from "effect/unstable/httpapi";
import { Uuid } from "../primitives/Uuid.schema.ts";
import { ClaimListBody } from "./claim/ClaimListBody.schema.ts";
import { ClaimListResponse } from "./claim/ClaimListResponse.schema.ts";
import { ClaimRejected } from "./claim/ClaimRejected.error.ts";
import { EditAccessDenied } from "./EditAccessDenied.error.ts";
import { ListWouldBeEmpty } from "./items/ListWouldBeEmpty.error.ts";
import { SaveListItemsBody } from "./items/SaveListItemsBody.schema.ts";
import { YearNotCovered } from "./items/YearNotCovered.error.ts";
import { List } from "./List.schema.ts";
import { ListNotFound } from "./ListNotFound.error.ts";
import { ConsumeRecoveryBody } from "./recover/consume/ConsumeRecoveryBody.schema.ts";
import { ConsumeRecoveryResponse } from "./recover/consume/ConsumeRecoveryResponse.schema.ts";
import { RecoveryLinkRejected } from "./recover/consume/RecoveryLinkRejected.error.ts";
import { RecoveryRejected } from "./recover/RecoveryRejected.error.ts";
import { RequestRecoveryBody } from "./recover/RequestRecoveryBody.schema.ts";
import { RequestRecoveryResponse } from "./recover/RequestRecoveryResponse.schema.ts";

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
				id: Uuid,
			},
			success: List,
			error: HttpApiSchema.status(404)(ListNotFound),
		}),
	)
	.add(
		/**
		 * Replace all of a List's Items in one write (ADR-003). Edit
		 * access is resource-scoped — it is the right to edit *this* List — so
		 * the credential is declared here on the endpoint rather than carried by
		 * middleware, which would have no path param to scope itself by. The
		 * answer is the stored List, so a client's next write starts from what
		 * this one left behind.
		 */
		HttpApiEndpoint.put("saveItems", `/${endpoint}/:id/items`, {
			params: {
				id: Uuid,
			},
			headers: {
				authorization: Schema.optional(Schema.String),
			},
			payload: SaveListItemsBody,
			success: List,
			error: [
				HttpApiSchema.status(404)(ListNotFound),
				HttpApiSchema.status(401)(EditAccessDenied),
				HttpApiSchema.status(422)(YearNotCovered),
				HttpApiSchema.status(422)(ListWouldBeEmpty),
			],
		}),
	)
	.add(
		HttpApiEndpoint.post("claim", `/${endpoint}`, {
			payload: ClaimListBody,
			success: ClaimListResponse,
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
	.annotate(OpenApi.Title, "Lists")
	.annotate(OpenApi.Description, "Manage Lists");
