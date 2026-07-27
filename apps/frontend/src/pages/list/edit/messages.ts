import { defineMessages } from "#/lib/language/defineMessages.ts";

// List-edit copy, per Language. A year is interpolated by the message itself,
// so each Language owns its own word order.
export const editMessages = defineMessages({
	en: {
		denied: "You don't have permission to edit this list.",
		editingSubtitle: "Editing your list",
		loading: "Loading your list…",
		needsOneGame: "A list needs at least one game.",
		yearFieldLabel: (year: number) => `Best game of ${year}`,
		save: "Save all",
	},
	fr: {
		denied: "Tu n'as pas la permission de modifier cette liste.",
		editingSubtitle: "Modification de ta liste",
		loading: "Chargement de ta liste…",
		needsOneGame: "Une liste a besoin d'au moins un jeu.",
		yearFieldLabel: (year: number) => `Meilleur jeu de ${year}`,
		save: "Tout enregistrer",
	},
});
