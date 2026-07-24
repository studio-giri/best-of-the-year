import { createFileRoute } from "@tanstack/react-router";
import { ConsumeRecovery } from "#/pages/recover/consume/ConsumeRecovery.tsx";

export const Route = createFileRoute("/_layout/recover/consume/$token")({
	component: RouteComponent,
});

function RouteComponent() {
	// The token is opaque base64url; the backend is the authority on validity, so
	// no format guard runs here.
	const { token } = Route.useParams();
	return <ConsumeRecovery token={token} />;
}
