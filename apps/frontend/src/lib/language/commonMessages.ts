import { defineMessages } from "./defineMessages.ts";
import { useLocalized } from "./LanguageProvider.tsx";

// Copy that's identical across languages, shared to avoid drift.
const siteTitle = "Games of the Year";
const footerCredit = "Crafted with 🤘 by Paulin";

/**
 * App-shell text shared across pages (header, footer...)
 */
export const commonMessages = defineMessages({
	en: {
		siteTitle,
		footerCredit,
		genericError: "Something went wrong, please try again later.",
		languageSwitcherLabel: "Language",
		createYourOwn: "Create your own",
	},
	fr: {
		siteTitle,
		footerCredit,
		genericError: "Une erreur est survenue, veuillez réessayer plus tard.",
		languageSwitcherLabel: "Langue",
		createYourOwn: "Crée ta propre liste !",
	},
});

// The current-Language slice of the shared app-shell copy.
export function useMessages(): typeof commonMessages.en {
	return useLocalized(commonMessages);
}
