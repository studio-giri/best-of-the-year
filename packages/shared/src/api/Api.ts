import { HttpApi, OpenApi } from "effect/unstable/httpapi";
import { ListsApi } from "./lists/ListsApi.ts";

/**
 * Shared API specification — pure data, consumed by both sides:
 * the backend implements it, the frontend derives a typed client from it.
 */
export const Api = HttpApi.make("api")
	.add(ListsApi)
	.annotate(OpenApi.Title, "Best Of The Year API")
	.annotate(OpenApi.Version, "1.0.0");
