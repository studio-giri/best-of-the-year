import { Schema } from "effect";

/**
 * The two Languages the site presents itself in — English and French. English
 * is both the Language shown before any choice is made and the fallback used
 * whenever a requested Language can't be resolved. Language is client-owned: it
 * rides in a cookie for the interface and in the recovery request body for the
 * email, and is never stored server-side.
 */
export const supportedLanguages = [
	"en",
	"fr",
] as const;

export const Language = Schema.Literals(supportedLanguages);

export type Language = Schema.Schema.Type<typeof Language>;

// Shown before a choice is made, and used whenever a Language can't be resolved.
export const defaultLanguage: Language = "en";

// Narrow an arbitrary value to a supported Language (used to coerce lenient
// inputs: a cookie value, the recovery body's language field).
export const isLanguage = Schema.is(Language);
