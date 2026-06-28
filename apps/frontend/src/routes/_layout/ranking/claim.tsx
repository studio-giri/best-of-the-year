import { createFileRoute } from "@tanstack/react-router";
import { ClaimRanking } from "#/pages/ranking/claim/ClaimRanking.tsx";

export const Route = createFileRoute("/_layout/ranking/claim")({
	component: ClaimRanking,
});
