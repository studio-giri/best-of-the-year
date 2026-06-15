import { Schema } from "effect";

export const Uuid = Schema.String.pipe(Schema.check(Schema.isUUID()));
