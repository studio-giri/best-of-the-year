import { useEffect, useState } from "react";
import { hasOwnerToken } from "#/lib/ownerTokens.ts";
import { RankingEditPage } from "./RankingEditPage.tsx";

interface Props {
	rankingId: string;
}

/**
 * Client-side edit-access grant (ADR-001): a browser may open the owner view
 * iff it holds a token for this ranking. The check runs after mount because
 * localStorage is client-only (SSR would always see "no token"); until it
 * resolves we render nothing. A browser without a token is refused the owner
 * shell and shown an access-denied message.
 */
export function RankingEditGuard({ rankingId }: Props) {
	// Three states, not a boolean: `null` means "not yet checked" — the token
	// lives in localStorage, which is unavailable during SSR and on the first
	// client render, so we can't tell owner from non-owner until the effect runs
	// post-mount. Collapsing to boolean would default that unknown state to one
	// of the real outcomes, flashing either the owner shell or the denied
	// message before the check resolves.
	const [granted, setGranted] = useState<boolean | null>(null);

	useEffect(() => {
		setGranted(hasOwnerToken(rankingId));
	}, [
		rankingId,
	]);

	if (granted === false) {
		return (
			<div>
				<p data-testid="edit-denied" className="text-center text-white">
					You don't have permission to edit this ranking.
				</p>
			</div>
		);
	}

	if (granted !== true) {
		return null;
	}

	return <RankingEditPage rankingId={rankingId} />;
}
