import { BunHttpServer } from "@effect/platform-bun";
import { Layer } from "effect";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiSwagger } from "effect/unstable/httpapi";
import { Api } from "./api";
import { PgClientLive } from "./db/PgClient";
import { PgDrizzleLive } from "./db/PgDrizzle";
import { Env } from "./env";
import { HttpApiHandlersLive } from "./http";

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
	Layer.provide(BunHttpServer.layer({})),
);
