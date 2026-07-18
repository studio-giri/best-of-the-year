import type { Language } from "@boty/shared/language/Language.schema";

interface DetailMessages {
	readonly notFound: string;
	readonly notFoundMalformed: string;
	// The "By <Username>" byline prefix. The Username itself is the person's data
	// and is never translated; only this prefix is.
	readonly by: string;
}

// Ranking-detail copy, per Language.
export const detailMessages = {
	en: {
		notFound: "Ranking not found",
		notFoundMalformed: "Ranking not found: the URL is malformed",
		by: "By",
	},
	fr: {
		notFound: "Classement introuvable",
		notFoundMalformed: "Classement introuvable : l'URL est incorrecte",
		by: "Par",
	},
} satisfies Record<Language, DetailMessages>;
