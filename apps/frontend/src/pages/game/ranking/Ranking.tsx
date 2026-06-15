import type { Ranking as RankingData } from "@boty/shared/schemas/Ranking.schema";
import { RankingItem } from "./RankingItem";

interface Props {
	items: RankingData["items"];
}
export function Ranking({ items }: Props) {
	/**
	 * Items arrive newest-first — the API owns the ordering guarantee
	 */
	return (
		<>
			{items.map((item) => (
				<RankingItem key={item.id} year={item.year} game={item.name} />
			))}
		</>
	);
}
