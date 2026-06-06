import { Api } from "@boty/shared/api/Api";
import { Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { HttpRankingsLive } from "./rankings/handlers.ts";

/**
 * All HTTP route handlers wired against the typed Api definition.
 *
 * DB dependencies (PgDrizzle) are intentionally left unresolved here so
 * callers (server and test setup) can provide whichever DB layer they need.
 */
export const HttpApiHandlersLive = Layer.provide(
	HttpApiBuilder.layer(Api, {
		openapiPath: "/openapi.json",
	}),
	Layer.mergeAll(HttpRankingsLive),
);
