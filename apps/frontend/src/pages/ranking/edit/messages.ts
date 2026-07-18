import type { Language } from "@boty/shared/language/Language.schema";

interface EditMessages {
	readonly denied: string;
	readonly editingSubtitle: string;
	// Owner confirmation lead-in; the ranking's id is appended as data, untranslated.
	readonly ownRanking: string;
}

// Ranking-edit copy, per Language.
export const editMessages = {
	en: {
		denied: "You don't have permission to edit this list.",
		editingSubtitle: "Editing your list",
		ownRanking: "You own this list",
	},
	fr: {
		denied: "Vous n'avez pas la permission de modifier cette liste.",
		editingSubtitle: "Modification de votre liste",
		ownRanking: "Vous possédez cette liste",
	},
} satisfies Record<Language, EditMessages>;
