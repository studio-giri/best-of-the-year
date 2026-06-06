import type { Ranking as RankingData } from "@boty/shared/schemas/Ranking.schema";
import { RankingItem } from "./RankingItem";

interface Props {
	items: RankingData["items"];
}
export function Ranking({ items }: Props) {
	/**
	 * Render items newest-first — the API does not guarantee an order
	 */
	const sortedItems = [
		...items,
	].sort((a, b) => b.year - a.year);

	return (
		<>
			{sortedItems.map((item) => (
				<RankingItem key={item.id} year={item.year} game={item.name} />
			))}
		</>
	);
}
