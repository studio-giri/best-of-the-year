import {
	defaultLanguage,
	isLanguage,
	type Language,
	supportedLanguages,
} from "@boty/shared/language/Language.schema";
import { match } from "@formatjs/intl-localematcher";

/**
 * Whether `tag` is a structurally valid BCP-47 language tag. Clients can send
 * malformed values (e.g. `foo!bar`) or the wildcard `*` in `Accept-Language`,
 * both of which make `Intl.getCanonicalLocales` — and therefore `match()` —
 * throw. Filtering them out keeps a single bad tag from discarding the whole
 * header.
 */
function isWellFormedLanguageTag(tag: string): boolean {
	try {
		Intl.getCanonicalLocales(tag);
		return true;
	} catch {
		return false;
	}
}

/**
 * Parse an `Accept-Language` header into its language tags, ordered by
 * descending quality (`q`) weight. Tags with `q=0` (explicitly not acceptable)
 * are dropped, as are structurally invalid tags. A missing weight defaults to
 * 1, per the header spec.
 */
export function parseAcceptLanguage(
	header: string | null | undefined,
): string[] {
	if (!header) {
		return [];
	}
	return header
		.split(",")
		.map((part) => {
			const segments = part.trim().split(";");
			const tag = (segments[0] ?? "").trim();
			const weight = segments.slice(1).find((s) => s.trim().startsWith("q="));
			const q = weight ? Number.parseFloat(weight.trim().slice(2)) : 1;
			return {
				tag,
				q: Number.isNaN(q) ? 0 : q,
			};
		})
		.filter(
			(entry) =>
				entry.tag !== "" && entry.q > 0 && isWellFormedLanguageTag(entry.tag),
		)
		.sort((a, b) => b.q - a.q)
		.map((entry) => entry.tag);
}

/**
 * Resolve the Language a browser prefers from its `Accept-Language` header,
 * falling back to English. Uses the standard locale-matching algorithm so a
 * regional tag like `fr-CA` still resolves to `fr`.
 */
export function negotiateAcceptLanguage(
	header: string | null | undefined,
): Language {
	const requested = parseAcceptLanguage(header);
	if (requested.length === 0) {
		return defaultLanguage;
	}
	try {
		const matched = match(
			requested,
			[
				...supportedLanguages,
			],
			defaultLanguage,
		);
		return isLanguage(matched) ? matched : defaultLanguage;
	} catch {
		return defaultLanguage;
	}
}
