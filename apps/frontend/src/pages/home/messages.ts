import type { Language } from "@boty/shared/language/Language.schema";

interface HomeMessages {
	readonly heading: string;
}

// Home page copy, per Language.
export const homeMessages = {
	en: {
		heading: "Homepage",
	},
	fr: {
		heading: "Accueil",
	},
} satisfies Record<Language, HomeMessages>;
