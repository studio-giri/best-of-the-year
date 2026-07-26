import { useMessages } from "#/lib/language/commonMessages.ts";
import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { Subtitle } from "#/ui/Subtitle.tsx";
import { editMessages } from "./messages.ts";
import { RankingEditForm } from "./RankingEditForm.tsx";
import { useRankingForEdit } from "./useRankingForEdit.query.ts";

interface Props {
	rankingId: string;
}

/**
 * Owner-view shell. Reaching it already proves edit access (the route guard
 * refuses browsers holding no token).
 *
 * The shell owns the heading and the two states the editor cannot render — the
 * list still being fetched, and the fetch having failed — and hands the games to
 * the form, which owns everything from there.
 */
export function RankingEditPage({ rankingId }: Props) {
	const messages = useLocalized(editMessages);
	const common = useMessages();
	const { data, isError } = useRankingForEdit(rankingId);

	return (
		<div data-testid="owner-view">
			<Subtitle>{messages.editingSubtitle}</Subtitle>
			{data ? (
				<RankingEditForm rankingId={rankingId} items={data.items} />
			) : (
				<p
					role={isError ? "alert" : undefined}
					className="text-center text-white"
				>
					{isError ? common.genericError : messages.loading}
				</p>
			)}
		</div>
	);
}
