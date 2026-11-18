import { defineMessages } from "#/lib/language/defineMessages.ts";

// List-edit copy, per Language. A year, a count or a time is interpolated by the
// message itself, so each Language owns its own word order and its own plural.
export const editMessages = defineMessages({
	en: {
		confirmLeave: (count: number) =>
			count === 1
				? "You have 1 unsaved entry. Leave anyway?"
				: `You have ${count} unsaved entries. Leave anyway?`,
		denied: "You don't have permission to edit this list.",
		editingSubtitle: "Editing your list",
		entriesUnsaved: (count: number) =>
			count === 1 ? "1 entry unsaved" : `${count} entries unsaved`,
		lastSavedAt: (time: string) => `Last saved at ${time}`,
		loading: "Loading your list…",
		needsOneEntry: "A list needs at least one entry",
		noChangesToSave: "No changes to save",
		yearFieldLabel: (year: number) => `Best game of ${year}`,
		save: "Save all",
		saving: "Saving…",
	},
	fr: {
		confirmLeave: (count: number) =>
			count === 1
				? "Tu as 1 entrée non enregistrée. Quitter quand même ?"
				: `Tu as ${count} entrées non enregistrées. Quitter quand même ?`,
		denied: "Tu n'as pas la permission de modifier cette liste.",
		editingSubtitle: "Modification de ta liste",
		entriesUnsaved: (count: number) =>
			count === 1
				? "1 entrée non enregistrée"
				: `${count} entrées non enregistrées`,
		lastSavedAt: (time: string) => `Dernier enregistrement à ${time}`,
		loading: "Chargement de ta liste…",
		needsOneEntry: "Une liste a besoin d'au moins une entrée",
		noChangesToSave: "Aucune modification à enregistrer",
		yearFieldLabel: (year: number) => `Meilleur jeu de ${year}`,
		save: "Tout enregistrer",
		saving: "Enregistrement…",
	},
});
