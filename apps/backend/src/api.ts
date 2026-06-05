import { HttpApi, OpenApi } from "effect/unstable/httpapi";
import { ListsApi } from "./lists/api.ts";
import { RankingsApi } from "./rankings/api.ts";

export const Api = HttpApi.make("api")
	.add(ListsApi)
	.add(RankingsApi)
	.annotate(OpenApi.Title, "Best Of The Year API")
	.annotate(OpenApi.Version, "1.0.0");
