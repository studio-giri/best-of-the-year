import { defineMessages } from "#/lib/language/defineMessages.ts";

// Ranking-edit copy, per Language.
export const editMessages = defineMessages({
	en: {
		denied: "You don't have permission to edit this list.",
		editingSubtitle: "Editing your list",
		// Owner confirmation lead-in; the ranking's id is appended as data, untranslated.
		ownRanking: "You own this list",
	},
	fr: {
		denied: "Vous n'avez pas la permission de modifier cette liste.",
		editingSubtitle: "Modification de votre liste",
		ownRanking: "Vous possédez cette liste",
	},
});
