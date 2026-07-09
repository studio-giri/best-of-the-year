/**
 * Recovery copy. Email-rejection wording (empty, invalid, unknown address) is
 * reused from the shared `emailRejectionMessages`; the string below is the
 * acceptance-criteria source of truth for the sent confirmation.
 */
export { emailRejectionMessages } from "#/lib/emailRejectionMessages.ts";

export const recoverySentMessage =
	"Check your inbox. We've emailed you a link to get back into your ranking.";
