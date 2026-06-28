import { Schema } from "effect";
import { ClaimRejectionCode } from "./ClaimRejectionCode.schema.ts";

/**
 * A claim was refused for a validation reason. Carries a machine `code` only —
 * the client renders the human message. Served as HTTP 422 (the input is
 * well-formed JSON but semantically unprocessable).
 */
export class ClaimRejected extends Schema.TaggedErrorClass<ClaimRejected>()(
	"ClaimRejected",
	{
		code: ClaimRejectionCode,
	},
) {}
