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

export interface OwnerLinkEmailProps {
	/** Absolute, single-use recovery URL: `${APP_BASE_URL}/recover/:token`. */
	readonly url: string;
}

/**
 * The email carrying an Owner recovery link (S-001-02). One primary action — the
 * link back into the person's ranking — plus a plain-text fallback URL for
 * clients that strip buttons. No account, no password: the link is the whole
 * credential, so the copy states its single-use, short-lived nature.
 */
export function OwnerLinkEmail({ url }: OwnerLinkEmailProps) {
	return (
		<Html lang="en">
			<Head />
			<Preview>Your link to get back into your ranking</Preview>
			<Body style={body}>
				<Container style={container}>
					<Heading style={heading}>Get back into your ranking</Heading>
					<Text style={text}>
						You asked to get back into your ranking. Use the button below — the
						link is single-use and expires soon.
					</Text>
					<Section style={buttonSection}>
						<Button href={url} style={button}>
							Open my ranking
						</Button>
					</Section>
					<Text style={mutedText}>
						If the button doesn't work, copy and paste this link into your
						browser:
					</Text>
					<Text style={urlText}>{url}</Text>
					<Text style={mutedText}>
						If you didn't request this, you can safely ignore this email.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

// react-email's preview server renders the default export and uses PreviewProps
// as sample data. The backend imports the named renderer, not this default.
OwnerLinkEmail.PreviewProps = {
	url: "http://localhost:3001/recover/preview-token",
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
	wordBreak: "break-all" as const,
	margin: "0 0 16px",
};
