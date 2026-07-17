import type { RecoveryRejectionCode } from "@boty/shared/api/rankings/recover/RecoveryRejectionCode.schema";

/**
 * The single client-side source of email-rejection wording, keyed by the recovery
 * rejection codes. `email_empty` / `email_invalid` are the shared `validateEmail`
 * codes the claim form also renders, so both flows show identical strings from one
 * definition — no cross-page import, no drift. `email_unknown` is recovery-only
 * (no ranking backs the address); its message keeps the person in the form.
 */
export const emailRejectionMessages: Record<RecoveryRejectionCode, string> = {
	email_empty: "Email cannot be empty.",
	email_invalid: "Email is invalid.",
	email_unknown: "No ranking exists for this email.",
};
