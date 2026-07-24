import { Api } from "@boty/shared/api/Api";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { claimRanking } from "./claim/claimRanking.handler.ts";
import { findRankingById } from "./find/findRankingById.handler.ts";
import { consumeRecovery } from "./recovery/consumeRecovery.handler.ts";
import { requestRecovery } from "./recovery/requestRecovery.handler.ts";

export const HttpRankingsLive = HttpApiBuilder.group(
	Api,
	"rankings",
	(handlers) =>
		handlers
			.handle("findById", ({ params }) => findRankingById(params.id))
			.handle("claim", ({ payload }) => claimRanking(payload))
			.handle("requestRecovery", ({ payload }) => requestRecovery(payload))
			.handle("consumeRecovery", ({ payload }) => consumeRecovery(payload)),
);
