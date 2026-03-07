import { useList } from "./useList.query";

export function List({ id }: { id: number }) {
	const { data } = useList(id);

	if (data) {
		return <pre>{JSON.stringify(data, null, 2)}</pre>;
	}

	return "Loading...";
}
