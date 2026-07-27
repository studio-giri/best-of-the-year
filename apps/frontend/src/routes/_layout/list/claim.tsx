import { createFileRoute } from "@tanstack/react-router";
import { ClaimList } from "#/pages/list/claim/ClaimList.tsx";

export const Route = createFileRoute("/_layout/list/claim")({
	component: ClaimList,
});
