import { defineMessages } from "#/lib/language/defineMessages.ts";

// The consume screen's copy, per Language: the brief in-progress indication
// shown while the link is exchanged for edit access. The transient-failure copy
// reuses the shared `genericError`, so it is not redefined here.
export const consumeMessages = defineMessages({
	en: {
		loading: "Getting you back into your list…",
		retryCtaLabel: "request a new link",
	},
	fr: {
		loading: "On te reconnecte à ta liste…",
		retryCtaLabel: "demande un nouveau lien",
	},
});
