import { Subtitle } from "#/ui/Subtitle.tsx";

interface Props {
	rankingId: string;
}

/**
 * Owner-view shell. Reaching it already proves edit access (the route guard
 * redirects browsers without a token to the public view). Item editing is out
 * of scope for this story — this just confirms the owner can get here.
 */
export function RankingEditPage({ rankingId }: Props) {
	return (
		<div>
			<Subtitle>Editing your ranking</Subtitle>
			<p data-testid="owner-view" className="text-center text-white">
				You own this ranking ({rankingId}).
			</p>
		</div>
	);
}
