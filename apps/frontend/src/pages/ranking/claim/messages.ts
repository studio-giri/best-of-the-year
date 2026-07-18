import type { ClaimRejectionCode } from "@boty/shared/api/rankings/claim/ClaimRejectionCode.schema";
import { emailRejectionMessages } from "#/lib/emailRejectionMessages.ts";
import { defineMessages } from "#/lib/language/defineMessages.ts";

/**
 * The claim form's copy, per Language. The `rejections` map renders the server's
 * machine codes, reusing the shared email wording so claim and recovery show
 * identical email rejections; its `satisfies Record<ClaimRejectionCode, string>`
 * makes an unmapped code a compile error. A claim that succeeds but whose Owner
 * token can't be saved shows `ownerTokenNotStored`, worded as terminal.
 */
export const claimMessages = defineMessages({
	en: {
		subtitle: "New list",
		usernameLabel: "Username",
		usernameHint: "Public, forever. Pick carefully. No pressure.",
		usernamePlaceholder: "YourUsername",
		emailLabel: "Email",
		emailHint:
			"So you don't lose access to your list. That's the only reason we ask.",
		emailPlaceholder: "your@email.com",
		submit: "lezgoo",
		rejections: {
			...emailRejectionMessages.en,
			username_empty: "Username cannot be empty.",
			username_too_short: "Username must be at least 2 characters.",
			username_too_long: "Username must be 30 characters or fewer.",
			username_taken: "Username taken. Pick another.",
		} satisfies Record<ClaimRejectionCode, string>,
		ownerTokenNotStored:
			"Your list was created, but this browser couldn't save your access to it. Open another browser and use the Recover List form to gain access.",
	},
	fr: {
		subtitle: "Nouvelle liste",
		usernameLabel: "Nom d'utilisateur",
		usernameHint: "Choisis bien, ou tu vas le regretter. Mais pas de pression.",
		usernamePlaceholder: "PseudoCringe",
		emailLabel: "E-mail",
		emailHint: "On en a besoin pour récupérer l'accès à ta liste, au cas où.",
		emailPlaceholder: "machin@email.com",
		submit: "c'est parti",
		rejections: {
			...emailRejectionMessages.fr,
			username_empty: "Tu n'as pas renseigné ton blaze !",
			username_too_short:
				"Le nom d'utilisateur doit comporter au moins 2 caractères.",
			username_too_long:
				"Le nom d'utilisateur ne peut pas dépasser 30 caractères.",
			username_taken: "Nom d'utilisateur déjà pris. Choisissez-en un autre.",
		},
		ownerTokenNotStored:
			"Votre liste a été créée, mais ce navigateur n'a pas pu enregistrer votre accès. Ouvrez un autre navigateur et utilisez le formulaire de récupération pour y accéder.",
	},
});
