import type { Ranking as RankingData } from "@boty/shared/api/rankings/Ranking.schema";
import { HorizontalRule } from "#/ui/HorizontalRule.tsx";
import { RankingItem } from "./RankingItem.tsx";

interface Props {
	items: RankingData["items"];
}
export function Ranking({ items }: Props) {
	/**
	 * Items arrive newest-first — the API owns the ordering guarantee
	 */
	return (
		<>
			<HorizontalRule />
			{items.map((item) => (
				<RankingItem key={item.id} year={item.year} game={item.name} />
			))}
		</>
	);
}
