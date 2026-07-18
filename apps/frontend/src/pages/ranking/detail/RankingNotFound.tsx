import type { NotFoundRouteProps } from "@tanstack/react-router";
import { useLocalized } from "#/lib/language/LanguageProvider.tsx";
import { detailMessages } from "./messages.ts";

export function RankingNotFound({ data }: NotFoundRouteProps) {
	const messages = useLocalized(detailMessages);
	const isMalformed =
		typeof data === "object" &&
		data !== null &&
		"reason" in data &&
		data.reason === "malformed";

	return (
		<p className="text-white text-center">
			{isMalformed ? messages.notFoundMalformed : messages.notFound}
		</p>
	);
}
