import type { Language } from "@boty/shared/language/Language.schema";

/**
 * `en` is the canonical shape: every other Language must define exactly its keys
 * — a missing or extra/typo'd key is a compile error, and no Language can be
 * omitted. `NoInfer` pins the shape to `en` so the other languages can't widen
 * it. Consumers get plain `string` values, not literals.
 */
export function defineMessages<T>(
	messages: {
		en: T;
	} & Record<Language, NoInfer<T>>,
): {
	en: T;
} & Record<Language, T> {
	return messages;
}
