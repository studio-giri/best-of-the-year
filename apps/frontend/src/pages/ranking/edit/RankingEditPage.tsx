import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { Subtitle } from "#/ui/Subtitle.tsx";
import { editMessages } from "./messages.ts";

interface Props {
	rankingId: string;
}

/**
 * Owner-view shell. Reaching it already proves edit access (the route guard
 * redirects browsers without a token to the public view). Item editing is out
 * of scope for this story — this just confirms the owner can get here.
 */
export function RankingEditPage({ rankingId }: Props) {
	const messages = useLocalized(editMessages);
	return (
		<div>
			<Subtitle>{messages.editingSubtitle}</Subtitle>
			<p data-testid="owner-view" className="text-center text-white">
				{/* The ranking id is data, appended untranslated. */}
				{`${messages.ownRanking} (${rankingId}).`}
			</p>
		</div>
	);
}
