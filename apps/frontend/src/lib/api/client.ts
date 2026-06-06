import { Api } from "@boty/shared/api/Api";
import { Effect } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

/**
 * Typed HTTP client derived from the shared API spec — paths, params,
 * response decoding and error types are all inferred from @boty/shared.
 *
 * Effect runtime usage stays confined to this module: consumers run the
 * returned effects with Effect.runPromise inside TanStack Query queryFns.
 */
export const client = Effect.runSync(
	HttpApiClient.make(Api, {
		baseUrl: import.meta.env.VITE_API_URL,
	}).pipe(Effect.provide(FetchHttpClient.layer)),
);
