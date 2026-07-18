import {
	isLanguage,
	type Language,
} from "@boty/shared/language/Language.schema";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, getRequestHeader } from "@tanstack/react-start/server";
import { LANGUAGE_COOKIE } from "./languageCookie.ts";
import { negotiateAcceptLanguage } from "./negotiateAcceptLanguage.ts";

/**
 * Resolve the reader's Language from the incoming request at SSR time:
 * an explicit cookie choice wins outright; absent that, negotiate the browser's
 * `Accept-Language`; English is the final fallback. Server-only (it reads the
 * request), so the first byte carries the correct `<html lang>` and copy.
 */
export const getServerLanguage = createServerFn({
	method: "GET",
}).handler((): Language => {
	const cookie = getCookie(LANGUAGE_COOKIE);
	if (cookie !== undefined && isLanguage(cookie)) {
		return cookie;
	}
	return negotiateAcceptLanguage(getRequestHeader("accept-language"));
});
