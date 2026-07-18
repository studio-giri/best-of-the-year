import type { RecoveryRejectionCode } from "@boty/shared/api/rankings/recover/RecoveryRejectionCode.schema";
import type { Language } from "@boty/shared/language/Language.schema";

/**
 * The single client-side source of email-rejection wording, per Language, keyed
 * by the recovery rejection codes. `email_empty` / `email_invalid` are the
 * shared `validateEmail` codes the claim form also renders, so both flows show
 * identical strings from one definition — no cross-page import, no drift.
 * `email_unknown` is recovery-only (no ranking backs the address); its message
 * keeps the person in the form. Typed so no Language can omit a code.
 */
export const emailRejectionMessages = {
	en: {
		email_empty: "Email cannot be empty.",
		email_invalid: "Email is invalid.",
		email_unknown: "No list exists for this email.",
	},
	fr: {
		email_empty: "Tu n'as pas renseigné d'email !",
		email_invalid: "L'e-mail est invalide.",
		email_unknown:
			"Tu as dû te tromper : aucune liste n'existe pour cet e-mail.",
	},
} satisfies Record<Language, Record<RecoveryRejectionCode, string>>;
