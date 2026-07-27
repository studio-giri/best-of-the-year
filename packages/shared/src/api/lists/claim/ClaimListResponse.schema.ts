import { Schema } from "effect";

/**
 * Returned once on a successful claim. `ownerToken` is the opaque bearer secret
 * the browser stores to own this list — the server keeps only its hash, so
 * this is the sole moment the raw token is visible. The full list is fetched
 * separately via GET; this carries just what the claiming browser needs.
 */
export const ClaimListResponse = Schema.Struct({
	id: Schema.String,
	username: Schema.String,
	ownerToken: Schema.String,
});

export type ClaimListResponse = Schema.Schema.Type<typeof ClaimListResponse>;
