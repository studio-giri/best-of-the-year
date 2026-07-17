import { Schema } from "effect";
import { RecoveryRejectionCode } from "./RecoveryRejectionCode.schema.ts";

/**
 * A recovery request was refused because the email is empty, malformed, or backs
 * no ranking. Carries a machine `code` only — the client renders the human
 * message (the same strings the claim flow uses). Served as HTTP 422 (well-formed
 * JSON, semantically unprocessable).
 */
export class RecoveryRejected extends Schema.TaggedErrorClass<RecoveryRejected>()(
	"RecoveryRejected",
	{
		code: RecoveryRejectionCode,
	},
) {}
