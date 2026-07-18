import type { ClaimRejectionCode } from "@boty/shared/api/rankings/claim/ClaimRejectionCode.schema";
import type { Language } from "@boty/shared/language/Language.schema";
import { emailRejectionMessages } from "#/lib/emailRejectionMessages.ts";

interface ClaimMessages {
	readonly subtitle: string;
	readonly usernameLabel: string;
	readonly usernameHint: string;
	readonly usernamePlaceholder: string;
	readonly emailLabel: string;
	readonly emailHint: string;
	readonly emailPlaceholder: string;
	readonly submit: string;
	// Server speaks machine codes; this renders them. Reuses the shared email
	// wording so claim and recovery show identical email rejections.
	readonly rejections: Record<ClaimRejectionCode, string>;
	readonly ownerTokenNotStored: string;
}

/**
 * The claim form's copy, per Language. Typed so no Language can omit a key (or a
 * rejection code) another defines — a missing translation is a compile error.
 * The `rejections` map renders the server's machine codes; a claim that
 * succeeds but whose Owner token can't be saved shows `ownerTokenNotStored`,
 * worded as terminal rather than retryable.
 */
export const claimMessages = {
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
		},
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
} satisfies Record<Language, ClaimMessages>;
