import { Schema } from "effect";

export class ListNotFound extends Schema.TaggedErrorClass<ListNotFound>()(
	"ListNotFound",
	{
		id: Schema.String,
	},
) {}
