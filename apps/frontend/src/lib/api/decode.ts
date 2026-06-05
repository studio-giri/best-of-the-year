import { Schema } from "effect";

export function decode<A, I>(schema: Schema.Codec<A, I>) {
	return (data: unknown): A => Schema.decodeUnknownSync(schema)(data);
}
