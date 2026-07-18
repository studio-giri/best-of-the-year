import type { Language } from "@boty/shared/language/Language.schema";

interface AboutMessages {
	readonly body: string;
}

// About page copy, per Language.
export const aboutMessages = {
	en: {
		body: "About!",
	},
	fr: {
		body: "À propos !",
	},
} satisfies Record<Language, AboutMessages>;
