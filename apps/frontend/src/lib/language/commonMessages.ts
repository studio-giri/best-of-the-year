import type { Language } from "@boty/shared/language/Language.schema";
import { useLocalized } from "./LanguageProvider.tsx";

interface CommonMessages {
	readonly siteTitle: string;
	readonly footerCredit: string;
	readonly genericError: string;
	readonly buttonLoading: string;
	readonly languageSwitcherLabel: string;
}

/**
 * App-shell copy shared across pages — the header title, the footer credit, the
 * generic transient-error lead-in, and accessible labels. Typed so `fr` cannot
 * omit a key `en` defines: a missing translation is a compile error.
 */
export const commonMessages = {
	en: {
		siteTitle: "Games of the Year",
		footerCredit: "Crafted with 🤘 by Paulin ·",
		genericError: "Something went wrong, please try again later.",
		buttonLoading: "Loading…",
		languageSwitcherLabel: "Language",
	},
	fr: {
		siteTitle: "Jeux de l'année",
		footerCredit: "Réalisé avec 🤘 par Paulin ·",
		genericError: "Une erreur est survenue, veuillez réessayer plus tard.",
		buttonLoading: "Chargement…",
		languageSwitcherLabel: "Langue",
	},
} satisfies Record<Language, CommonMessages>;

// The current-Language slice of the shared app-shell copy.
export function useMessages(): CommonMessages {
	return useLocalized(commonMessages);
}
