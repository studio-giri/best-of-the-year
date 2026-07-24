import { createFileRoute } from "@tanstack/react-router";
import { RequestRecovery } from "#/pages/recover/request/RequestRecovery.tsx";

export const Route = createFileRoute("/_layout/recover/request")({
	component: RequestRecovery,
});
