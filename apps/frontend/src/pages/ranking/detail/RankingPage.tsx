import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { Subtitle } from "#/ui/Subtitle.tsx";
import { detailMessages } from "./messages.ts";
import { Ranking } from "./Ranking.tsx";
import { useRanking } from "./useRanking.query.ts";

interface Props {
	rankingId: string;
}

export function RankingPage({ rankingId }: Props) {
	const messages = useLocalized(detailMessages);
	const { data } = useRanking(rankingId);

	return (
		<div>
			{/* Prefix is translated; the Username is the person's data, shown as entered. */}
			<Subtitle>
				{messages.by} {data.username}
			</Subtitle>
			<Ranking items={data.items} />
		</div>
	);
}
