import { Subtitle } from "#/ui/Subtitle.tsx";
import { Ranking } from "./Ranking.tsx";
import { useRanking } from "./useRanking.query.ts";

interface Props {
	rankingId: string;
}

export function RankingPage({ rankingId }: Props) {
	const { data } = useRanking(rankingId);

	return (
		<div>
			<Subtitle>By {data.username}</Subtitle>
			<Ranking items={data.items} />
		</div>
	);
}
