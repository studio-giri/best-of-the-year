import {
	defaultLanguage,
	isLanguage,
	type Language,
} from "@boty/shared/language/Language.schema";

/**
 * Coerce the recovery request's lenient `language` field to a supported
 * Language. Anything absent or unrecognized becomes English, so a cosmetic
 * detail can never turn recovery — the lockout safety net — into a failure.
 */
export function coerceLanguage(raw?: string): Language {
	return raw !== undefined && isLanguage(raw) ? raw : defaultLanguage;
}
