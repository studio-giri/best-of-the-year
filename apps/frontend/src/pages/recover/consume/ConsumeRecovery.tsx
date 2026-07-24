import { RecoveryLinkRejected } from "@boty/shared/api/rankings/recover/consume/RecoveryLinkRejected.error";
import { Link, useNavigate } from "@tanstack/react-router";
import { Schema } from "effect";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "#/lib/language/commonMessages.ts";
import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { setOwnerToken } from "#/lib/ownerTokens.ts";
import { consumeMessages } from "./messages.ts";
import { useConsumeRecovery } from "./useConsumeRecovery.mutation.ts";

interface Props {
	token: string;
}

/**
 * Consume screen: the destination of an emailed recovery link. On mount it
 * exchanges the token in the URL for a fresh Owner token, with no confirmation
 * step — a brief in-progress indication resolves on its own into the editor. A
 * transient failure falls back to a generic retry with a path back to the
 * request form; no owner view is opened.
 */
export function ConsumeRecovery({ token }: Props) {
	const messages = useLocalized(consumeMessages);
	const common = useMessages();
	const navigate = useNavigate();
	const consumeRecovery = useConsumeRecovery();

	// The message shown once the exchange has failed; null while still in flight or
	// on the happy path. A server refusal (used / expired / invalid link) sets a
	// permanent per-code line; a transport failure sets the transient generic. Both
	// flip the in-progress card to the same retry layout.
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// The exchange is a one-shot side effect: a ref guards against a second fire
	// (e.g. a StrictMode double mount) re-consuming the same link.
	const startedRef = useRef(false);
	const { mutateAsync } = consumeRecovery;
	useEffect(() => {
		if (startedRef.current) {
			return;
		}
		startedRef.current = true;

		// Exchange the link, then store the minted token BEFORE navigating so the
		// owner guard finds the grant already in place once the redirect lands.
		mutateAsync({
			token,
		})
			.then(async ({ id, ownerToken }) => {
				setOwnerToken(id, ownerToken);
				await navigate({
					to: "/ranking/$rankingId/edit",
					params: {
						rankingId: id,
					},
				});
			})
			.catch((error: unknown) => {
				// A server refusal is a permanent dead end: render the fixed per-code
				// line, no "try again later". Anything else (transport failure, or a
				// token that can't be stored) is transient and falls back to the generic
				// retry. Either way the owner view is never opened.
				if (Schema.is(RecoveryLinkRejected)(error)) {
					setErrorMessage(messages.rejections[error.code]);
					return;
				}
				setErrorMessage(common.genericError);
				console.error(error);
			});
	}, [
		mutateAsync,
		token,
		navigate,
		messages,
		common,
	]);

	if (errorMessage !== null) {
		return (
			<div className="max-w-xl mx-auto">
				<div className="bg-surface/90 rounded-2xl mx-3 p-8">
					<p role="alert" className="text-white">
						<span>{errorMessage}</span>{" "}
						<Link to="/recover/request" className="underline">
							{messages.retryCtaLabel}
						</Link>
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-xl mx-auto">
			<div className="bg-surface/90 rounded-2xl mx-3 p-8">
				<p role="status" className="text-white inline-flex items-center gap-2">
					<Loader2 className="size-4 animate-spin" aria-hidden="true" />
					{messages.loading}
				</p>
			</div>
		</div>
	);
}
