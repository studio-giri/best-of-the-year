import { render } from "@react-email/render";
import {
	OwnerLinkEmail,
	type OwnerLinkEmailProps,
} from "../emails/owner-link.tsx";

export type { OwnerLinkEmailProps };

export interface RenderedEmail {
	readonly html: string;
	readonly text: string;
}

/**
 * Render the Owner recovery email to both an HTML body and a plain-text
 * fallback from the one react-email template, so a `sendMail` can attach both
 * parts. Kept pure (no transport, no I/O beyond rendering) so the backend's
 * Mailer layer owns delivery and this package stays a template concern.
 */
export async function renderOwnerLink(
	props: OwnerLinkEmailProps,
): Promise<RenderedEmail> {
	const element = OwnerLinkEmail(props);
	const [html, text] = await Promise.all([
		render(element),
		render(element, {
			plainText: true,
		}),
	]);
	return {
		html,
		text,
	};
}
