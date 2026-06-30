import { Api } from "@boty/shared/api/Api";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { claimRanking } from "./claimRanking.handler.ts";
import { findRankingById } from "./findRankingById.handler.ts";

export const HttpRankingsLive = HttpApiBuilder.group(
	Api,
	"rankings",
	(handlers) =>
		handlers
			.handle("findById", ({ params }) => findRankingById(params.id))
			.handle("claim", ({ payload }) => claimRanking(payload)),
);
