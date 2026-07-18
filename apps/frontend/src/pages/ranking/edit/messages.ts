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
		denied: "You don't have permission to edit this ranking.",
		editingSubtitle: "Editing your ranking",
		ownRanking: "You own this ranking",
	},
	fr: {
		denied: "Vous n'avez pas la permission de modifier ce classement.",
		editingSubtitle: "Modification de votre classement",
		ownRanking: "Vous possédez ce classement",
	},
} satisfies Record<Language, EditMessages>;
