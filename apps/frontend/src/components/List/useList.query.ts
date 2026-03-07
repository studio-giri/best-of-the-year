import { List } from "@boty/shared/schemas/List.schema";
import { useQuery } from "@tanstack/react-query";
import { api } from "#/lib/api/api";
import { decode } from "#/lib/api/decode";

export function useList(id: number) {
	return useQuery({
		queryKey: ["list", id],
		enabled: Number.isFinite(id),
		queryFn: async () => api.get(`/lists/${id}`).then(decode(List)),
	});
}
