import { Schema } from "effect";
import { RecoveryLinkRejectionCode } from "./RecoveryLinkRejectionCode.schema.ts";

/**
 * Consuming a recovery link was refused. Carries a machine `code` only — the
 * client renders the human message. Served as HTTP 422 (well-formed JSON,
 * semantically unprocessable).
 */
export class RecoveryLinkRejected extends Schema.TaggedErrorClass<RecoveryLinkRejected>()(
	"RecoveryLinkRejected",
	{
		code: RecoveryLinkRejectionCode,
	},
) {}
