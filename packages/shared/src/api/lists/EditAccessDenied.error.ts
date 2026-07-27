import { Schema } from "effect";

/**
 * The credential presented does not grant edit access to this List: the
 * List exists, but no Owner token proving the right to edit it was shown
 * (ADR-001). Served as HTTP 401 — recovery, not a retry, is what resolves it.
 */
export class EditAccessDenied extends Schema.TaggedErrorClass<EditAccessDenied>()(
	"EditAccessDenied",
	{
		id: Schema.String,
	},
) {}
