import type { RecoveryLinkRejectionCode } from "@boty/shared/api/rankings/recover/consume/RecoveryLinkRejectionCode.schema";
import { defineMessages } from "#/lib/language/defineMessages.ts";

// The consume screen's copy, per Language: the brief in-progress indication
// shown while the link is exchanged for edit access, and the permanent per-code
// lines shown when the server refuses the link. The `rejections` map's
// `satisfies Record<RecoveryLinkRejectionCode, string>` makes an unmapped code a
// compile error; each code gets its own fixed line (invalid is distinct from
// used/expired, and none of them is the transient generic). Only a genuine
// transport failure reuses the shared `genericError`, so that copy is not
// redefined here.
export const consumeMessages = defineMessages({
	en: {
		loading: "Getting you back into your list…",
		retryCtaLabel: "Request a new link",
		rejections: {
			link_invalid: "This link isn't valid.",
			link_used: "This link has already been used.",
			link_expired: "This link has expired.",
		} satisfies Record<RecoveryLinkRejectionCode, string>,
	},
	fr: {
		loading: "On te reconnecte à ta liste…",
		retryCtaLabel: "Demande un nouveau lien",
		rejections: {
			link_invalid: "Ce lien n'est pas valide.",
			link_used: "Ce lien a déjà été utilisé.",
			link_expired: "Ce lien a expiré.",
		} satisfies Record<RecoveryLinkRejectionCode, string>,
	},
});
