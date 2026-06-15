import { Api } from "@boty/shared/api/Api";
import { BunHttpServer } from "@effect/platform-bun";
import { Config, Layer } from "effect";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiSwagger } from "effect/unstable/httpapi";
import { PgClientLive } from "./db/PgClient.ts";
import { PgDrizzleLive } from "./db/PgDrizzle.ts";
import { Env } from "./env.ts";
import { HttpApiHandlersLive } from "./http.ts";

const DbLive = PgClientLive.pipe(Layer.provide(Env.Live));

/**
 * Handler dependencies (PgDrizzle) are request-scoped in v4's HttpRouter, so
 * they must be provided with HttpRouter.provideRequest rather than
 * Layer.provide. The PgClient itself is a regular (global) layer.
 */
const ApiLive = HttpApiHandlersLive.pipe(
	HttpRouter.provideRequest(PgDrizzleLive),
	Layer.provide(DbLive),
);

/**
 * Everything that registers routes into the HttpRouter: the typed API
 * handlers, the Swagger UI and the CORS middleware. Request logging is
 * enabled by default in v4's HttpRouter.serve.
 */
const AppLive = Layer.mergeAll(
	ApiLive,
	HttpApiSwagger.layer(Api),
	HttpRouter.cors(),
);

export const Server = HttpRouter.serve(AppLive).pipe(
	HttpServer.withLogAddress,
	Layer.provide(
		BunHttpServer.layerConfig({
			// Listen port is declared and overridable via PORT (default 3000)
			port: Config.withDefault(Config.number("PORT"), 3000),
		}),
	),
);
