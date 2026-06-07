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
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
	throw new Error("VITE_API_URL is not set");
}

// Fail fast on a malformed URL at boot rather than surfacing it as a
// confusing request error on the first API call.
try {
	new URL(apiUrl);
} catch (error) {
	throw new Error(`VITE_API_URL is not a valid URL: ${apiUrl}`, {
		cause: error,
	});
}

export const client = Effect.runSync(
	HttpApiClient.make(Api, {
		baseUrl: apiUrl,
	}).pipe(Effect.provide(FetchHttpClient.layer)),
);
