import { HttpApi, OpenApi } from "effect/unstable/httpapi";
import { RankingsApi } from "./rankings/RankingsApi.ts";

/**
 * Shared API specification — pure data, consumed by both sides:
 * the backend implements it, the frontend derives a typed client from it.
 */
export const Api = HttpApi.make("api")
	.add(RankingsApi)
	.annotate(OpenApi.Title, "Best Of The Year API")
	.annotate(OpenApi.Version, "1.0.0");
