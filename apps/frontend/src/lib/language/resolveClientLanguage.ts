import {
	defaultLanguage,
	isLanguage,
	type Language,
} from "@boty/shared/language/Language.schema";
import { readLanguageCookie } from "./languageCookie.ts";

/**
 * The reader's Language during client-side navigation. An explicit cookie
 * choice wins; otherwise keep whatever the document already shows — set at SSR
 * from `Accept-Language` and kept current by the LanguageProvider — so a
 * navigation never resets a first-visit guess back to English.
 */
export function resolveClientLanguage(): Language {
	const fromCookie = readLanguageCookie(document.cookie);
	if (fromCookie) {
		return fromCookie;
	}
	const current = document.documentElement.lang;
	return isLanguage(current) ? current : defaultLanguage;
}
