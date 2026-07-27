import { Schema } from "effect";

/**
 * The closed set of machine-readable reasons consuming a recovery link can be
 * refused. `link_invalid` names no outstanding recovery row (never issued, or a
 * truncated/garbled token); `link_used` is a link already spent once;
 * `link_expired` is a link past its 48h lifetime. All three are permanent — the
 * client renders a fixed per-code message with a path back to the request form,
 * distinct from the transient "try again later" shown only for a transport
 * failure. A used link reports as `link_used` even once also expired.
 */
export const RecoveryLinkRejectionCode = Schema.Literals([
	"link_invalid",
	"link_used",
	"link_expired",
]);

export type RecoveryLinkRejectionCode = Schema.Schema.Type<
	typeof RecoveryLinkRejectionCode
>;
