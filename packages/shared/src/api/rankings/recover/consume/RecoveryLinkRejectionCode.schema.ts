import { Schema } from "effect";

/**
 * The closed set of machine-readable reasons consuming a recovery link can be
 * refused. `link_invalid` covers a link that names no outstanding recovery row —
 * the client renders a generic retry with a path back to the request form. The
 * literal set is the extension point for the used- and expired-link branches.
 */
export const RecoveryLinkRejectionCode = Schema.Literals([
	"link_invalid",
]);

export type RecoveryLinkRejectionCode = Schema.Schema.Type<
	typeof RecoveryLinkRejectionCode
>;
