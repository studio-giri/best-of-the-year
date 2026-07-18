import type { RecoveryRejectionCode } from "@boty/shared/api/rankings/recover/RecoveryRejectionCode.schema";
import type { Language } from "@boty/shared/language/Language.schema";
import { emailRejectionMessages } from "#/lib/emailRejectionMessages.ts";

interface RecoverMessages {
	readonly subtitle: string;
	readonly emailLabel: string;
	readonly emailHint: string;
	readonly emailPlaceholder: string;
	readonly submit: string;
	readonly sent: string;
	// Email-rejection wording (empty, invalid, unknown address) reused from the
	// shared source so claim and recovery render it identically.
	readonly rejections: Record<RecoveryRejectionCode, string>;
}

/**
 * The recovery form's copy, per Language. Typed so no Language can omit a key
 * another defines — a missing translation is a compile error.
 */
export const recoverMessages = {
	en: {
		subtitle: "Recover your ranking",
		emailLabel: "Email",
		emailHint: "The address you used when you created your ranking.",
		emailPlaceholder: "your@email.com",
		submit: "Email me a link",
		sent: "Check your inbox. We've emailed you a link to get back into your ranking.",
		rejections: emailRejectionMessages.en,
	},
	fr: {
		subtitle: "Récupérer votre classement",
		emailLabel: "E-mail",
		emailHint: "L'adresse que vous avez utilisée en créant votre classement.",
		emailPlaceholder: "vous@email.com",
		submit: "Envoyez-moi un lien",
		sent: "Vérifiez votre boîte de réception. Nous vous avons envoyé un lien pour revenir dans votre classement.",
		rejections: emailRejectionMessages.fr,
	},
} satisfies Record<Language, RecoverMessages>;
