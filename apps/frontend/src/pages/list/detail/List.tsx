import type { List as ListData } from "@boty/shared/api/lists/List.schema";
import { HorizontalRule } from "#/ui/HorizontalRule.tsx";
import { ListRow } from "#/ui/ListRow.tsx";

interface Props {
	items: ListData["items"];
}
export function List({ items }: Props) {
	/**
	 * Items arrive newest-first — the API owns the ordering guarantee
	 */
	return (
		<>
			<HorizontalRule />
			{items.map((item) => (
				<ListRow key={item.id} year={item.year}>
					{item.name}
				</ListRow>
			))}
		</>
	);
}
