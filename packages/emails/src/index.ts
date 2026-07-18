import { render } from "@react-email/render";
import { createElement } from "react";
import {
	OwnerLinkEmail,
	type OwnerLinkEmailProps,
	ownerLinkSubject,
} from "../emails/owner-link.tsx";

export type { OwnerLinkEmailProps };

export interface RenderedEmail {
	readonly subject: string;
	readonly html: string;
	readonly text: string;
}

/**
 * Render the Owner recovery email — subject plus an HTML body and a plain-text
 * fallback — from the one react-email template. Returns the whole email
 * content so the backend's Mailer only relays from/to and dispatches; all copy
 * (subject included) stays a template concern in this package.
 */
export async function renderOwnerLink(
	props: OwnerLinkEmailProps,
): Promise<RenderedEmail> {
	const element = createElement(OwnerLinkEmail, props);
	const [html, text] = await Promise.all([
		render(element),
		render(element, {
			plainText: true,
		}),
	]);
	return {
		subject: ownerLinkSubject,
		html,
		text,
	};
}
