import { Schema } from "effect";

/**
 * Returned once on a successful claim. `ownerToken` is the opaque bearer secret
 * the browser stores to own this ranking — the server keeps only its hash, so
 * this is the sole moment the raw token is visible. The full ranking is fetched
 * separately via GET; this carries just what the claiming browser needs.
 */
export const ClaimRankingResponse = Schema.Struct({
	id: Schema.String,
	username: Schema.String,
	ownerToken: Schema.String,
});

export type ClaimRankingResponse = Schema.Schema.Type<
	typeof ClaimRankingResponse
>;
