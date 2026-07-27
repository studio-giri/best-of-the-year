import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { Subtitle } from "#/ui/Subtitle.tsx";
import { List } from "./List.tsx";
import { detailMessages } from "./messages.ts";
import { useList } from "./useList.query.ts";

interface Props {
	listId: string;
}

export function ListPage({ listId }: Props) {
	const messages = useLocalized(detailMessages);
	const { data } = useList(listId);

	return (
		<div>
			<Subtitle>
				{messages.by} {data.username}
			</Subtitle>
			<List items={data.items} />
		</div>
	);
}
