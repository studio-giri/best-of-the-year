import { emailRejectionMessages } from "#/lib/emailRejectionMessages.ts";
import { defineMessages } from "#/lib/language/defineMessages.ts";

// The recovery form's copy, per Language. `rejections` reuses the shared
// email-rejection wording so claim and recovery render it identically.
export const recoverMessages = defineMessages({
	en: {
		subtitle: "Recover your list",
		emailLabel: "Email",
		emailHint: "The address you used when you created your list.",
		emailPlaceholder: "your@email.com",
		submit: "Email me a link",
		sent: "Check your inbox. We've emailed you a link to get back into your list.",
		rejections: emailRejectionMessages.en,
	},
	fr: {
		subtitle: "Récupérer votre liste",
		emailLabel: "E-mail",
		emailHint: "L'adresse que vous avez utilisée en créant votre liste.",
		emailPlaceholder: "vous@email.com",
		submit: "Envoyez-moi un lien",
		sent: "Vérifiez votre boîte de réception. Nous vous avons envoyé un lien pour récupérer l'accès à votre liste.",
		rejections: emailRejectionMessages.fr,
	},
});
