import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

// A local Language union kept independent of `@boty/shared` so this package
// stays dependency-minimal; the backend (the renderer's sole caller) passes the
// shared Language value in, so any drift with this union surfaces there.
type Language = "en" | "fr";

export interface OwnerLinkEmailProps {
	// Absolute, single-use recovery URL
	readonly url: string;
	// Language the email is written in — the reader's current Language, passed
	// through from the recovery request.
	readonly language: Language;
}

interface Copy {
	readonly preview: string;
	readonly heading: string;
	readonly intro: string;
	readonly button: string;
	readonly fallbackHint: string;
	readonly ignoreHint: string;
}

// Every string the email shows, per Language. Adding a Language means adding an
// entry here (and to `ownerLinkSubject`).
const copy: Record<Language, Copy> = {
	en: {
		preview: "A single-use link to reopen your ranking",
		heading: "Let's get you back in",
		intro:
			"Here's the recovery link you asked for. It's single-use and expires in 48h.",
		button: "Recover my ranking",
		fallbackHint:
			"If the button doesn't work, copy and paste this link into your browser:",
		ignoreHint: "If you didn't request this, you can safely ignore this email.",
	},
	fr: {
		preview: "Un lien à usage unique pour rouvrir votre classement",
		heading: "On vous reconnecte",
		intro:
			"Voici le lien de récupération que vous avez demandé. Il est à usage unique et expire dans 48 h.",
		button: "Récupérer mon classement",
		fallbackHint:
			"Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :",
		ignoreHint:
			"Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.",
	},
};

// Subject line of the Owner recovery email, per Language.
export const ownerLinkSubject: Record<Language, string> = {
	en: "Get back into your ranking",
	fr: "Récupérez l'accès à votre classement",
};

/**
 * The email carrying an Owner recovery link. One primary action — the link back
 * into the person's ranking — plus a plain-text fallback URL for clients that
 * strip buttons. No account, no password: the link is the whole credential, so
 * the copy states its single-use, short-lived nature. Written in the reader's
 * Language, with `<html lang>` set to match.
 */
export function OwnerLinkEmail({ url, language }: OwnerLinkEmailProps) {
	const t = copy[language];
	return (
		<Html lang={language}>
			<Head />
			<Preview>{t.preview}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={heading}>{t.heading}</Heading>
					<Text style={text}>{t.intro}</Text>
					<Section style={buttonSection}>
						<Button href={url} style={button}>
							{t.button}
						</Button>
					</Section>
					<Text style={mutedText}>{t.fallbackHint}</Text>
					<Text style={urlText}>{url}</Text>
					<Text style={mutedText}>{t.ignoreHint}</Text>
				</Container>
			</Body>
		</Html>
	);
}

// react-email's preview server renders the default export and uses PreviewProps
// as sample data. The backend imports the named renderer, not this default.
OwnerLinkEmail.PreviewProps = {
	url: "http://localhost:3001/recover/preview-token",
	language: "en",
} satisfies OwnerLinkEmailProps;

export default OwnerLinkEmail;

const body = {
	backgroundColor: "#f5f5f5",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
	margin: "0 auto",
	padding: "32px 24px",
	maxWidth: "480px",
	backgroundColor: "#ffffff",
	borderRadius: "8px",
};

const heading = {
	fontSize: "22px",
	fontWeight: "700",
	color: "#111111",
	margin: "0 0 16px",
};

const text = {
	fontSize: "15px",
	lineHeight: "24px",
	color: "#333333",
	margin: "0 0 16px",
};

const buttonSection = {
	margin: "24px 0",
};

const button = {
	backgroundColor: "#111111",
	color: "#ffffff",
	fontSize: "15px",
	fontWeight: "600",
	textDecoration: "none",
	padding: "12px 24px",
	borderRadius: "6px",
	display: "inline-block",
};

const mutedText = {
	fontSize: "13px",
	lineHeight: "20px",
	color: "#777777",
	margin: "0 0 8px",
};

const urlText = {
	fontSize: "13px",
	lineHeight: "20px",
	color: "#2563eb",
	overflowWrap: "break-word" as const,
	wordBreak: "break-all" as const,
	margin: "0 0 16px",
};
