import {
	isLanguage,
	type Language,
} from "@boty/shared/language/Language.schema";

// The cookie holding an explicit Language choice. Client-written (so not
// httpOnly) and readable at SSR time, so the first paint is already localized.
export const LANGUAGE_COOKIE = "lang";

// A year: long enough that a returning reader keeps their choice without it
// becoming a permanent, un-expiring record.
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Read an explicit Language choice from a Cookie header string. Returns the
 * Language only when the cookie is present and holds a supported value —
 * anything else is treated as "no explicit choice".
 */
export function readLanguageCookie(
	cookieHeader: string | null | undefined,
): Language | undefined {
	if (!cookieHeader) {
		return undefined;
	}
	for (const pair of cookieHeader.split(";")) {
		const separator = pair.indexOf("=");
		if (separator === -1) {
			continue;
		}
		const name = pair.slice(0, separator).trim();
		if (name !== LANGUAGE_COOKIE) {
			continue;
		}
		const value = decodeURIComponent(pair.slice(separator + 1).trim());
		return isLanguage(value) ? value : undefined;
	}
	return undefined;
}

/**
 * Persist an explicit Language choice on this browser, so future visits (and
 * the SSR render that reads the cookie) inherit it. SameSite=Lax and no
 * httpOnly, since client JS both writes and later reads it.
 */
export function writeLanguageCookie(language: Language): void {
	// biome-ignore lint/suspicious/noDocumentCookie: value is a validated Language, and the Cookie Store API is async and unavailable in Safari — overkill for one cookie.
	document.cookie = `${LANGUAGE_COOKIE}=${language}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}
