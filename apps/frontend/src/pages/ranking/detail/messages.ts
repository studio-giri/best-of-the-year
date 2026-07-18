import { defineMessages } from "#/lib/language/defineMessages.ts";

// Ranking-detail copy, per Language.
export const detailMessages = defineMessages({
	en: {
		notFound: "List not found",
		notFoundMalformed: "List not found: the URL is malformed",
		// The "By <Username>" byline prefix.
		by: "By",
	},
	fr: {
		notFound: "Liste introuvable",
		notFoundMalformed: "Liste introuvable : l'URL est incorrecte",
		by: "Par",
	},
});
