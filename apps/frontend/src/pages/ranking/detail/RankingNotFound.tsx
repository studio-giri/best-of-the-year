import type { NotFoundRouteProps } from "@tanstack/react-router";

export function RankingNotFound({ data }: NotFoundRouteProps) {
	const isMalformed =
		typeof data === "object" &&
		data !== null &&
		"reason" in data &&
		data.reason === "malformed";

	return (
		<p className="text-white text-center">
			{isMalformed
				? "Ranking not found: the URL is malformed"
				: "Ranking not found"}
		</p>
	);
}
