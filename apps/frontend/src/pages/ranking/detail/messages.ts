import { defineMessages } from "#/lib/language/defineMessages.ts";

// Ranking-detail copy, per Language.
export const detailMessages = defineMessages({
	en: {
		notFound: "List not found",
		notFoundMalformed: "List not found: the URL is malformed",
		// The "By <Username>" byline prefix. The Username itself is the person's data
		// and is never translated; only this prefix is.
		by: "By",
	},
	fr: {
		notFound: "Liste introuvable",
		notFoundMalformed: "Liste introuvable : l'URL est incorrecte",
		by: "Par",
	},
});
