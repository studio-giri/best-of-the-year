import { HorizontalRule } from "#/ui/HorizontalRule";
import { Ranking } from "./Ranking";
import { useRanking } from "./useRanking.query";

interface Props {
	rankingId: string;
}

export function RankingPage({ rankingId }: Props) {
	const { data } = useRanking(rankingId);

	return (
		<div>
			<HorizontalRule size="small" />
			<h2 className="text-white text-center font-semibold  p-8 pt-2">
				By {data.author}
			</h2>
			<HorizontalRule />
			<Ranking items={data.items} />
		</div>
	);
}
