import { Schema } from "effect";

export const Email = Schema.TemplateLiteral([
	Schema.String.pipe(Schema.check(Schema.isNonEmpty())),
	"@",
	Schema.String.pipe(Schema.check(Schema.isNonEmpty())),
	".",
	Schema.String.pipe(Schema.check(Schema.isNonEmpty())),
]);
