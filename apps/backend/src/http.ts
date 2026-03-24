import { HttpApiBuilder } from "@effect/platform";
import { Layer } from "effect";
import { Api } from "./api.ts";
import { HttpListsLive } from "./lists/handlers.ts";
import { HttpRankingsLive } from "./rankings/handlers.ts";

/**
 * All HTTP route handlers wired against the typed Api definition.
 *
 * DB dependencies (PgDrizzle) are intentionally left unresolved here so
 * callers (server and test setup) can provide whichever DB layer they need.
 */
export const HttpApiHandlersLive = Layer.provide(HttpApiBuilder.api(Api), [
	HttpListsLive,
	HttpRankingsLive,
]);
