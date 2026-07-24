import { Link, useNavigate } from "@tanstack/react-router";
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

	// True once the exchange has failed; flips the in-progress card to the retry.
	const [failed, setFailed] = useState(false);

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
			.catch((error) => {
				// A transport failure (or a token that can't be stored) falls back to a
				// generic retry; the owner view is never opened.
				setFailed(true);
				console.error(error);
			});
	}, [
		mutateAsync,
		token,
		navigate,
	]);

	if (failed) {
		return (
			<div className="max-w-xl mx-auto">
				<div className="bg-surface/90 rounded-2xl mx-3 p-8">
					<p role="alert" className="text-white">
						{common.genericError}{" "}
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
