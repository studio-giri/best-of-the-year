import { createFileRoute } from "@tanstack/react-router";
import { RequestRecovery } from "#/pages/recover/RequestRecovery.tsx";

export const Route = createFileRoute("/_layout/recover")({
	component: RequestRecovery,
});
