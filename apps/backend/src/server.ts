import {
	HttpApiBuilder,
	HttpApiSwagger,
	HttpMiddleware,
	HttpServer,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { layer as PgDrizzleLayer } from "@effect/sql-drizzle/Pg";
import { Layer } from "effect";
import { PgClientLive } from "./db/PgClient";
import { Env } from "./env";
import { HttpApiHandlersLive } from "./http";

const DbLive = PgClientLive.pipe(Layer.provide(Env.Live));

const ApiLive = HttpApiHandlersLive.pipe(
	Layer.provide(PgDrizzleLayer),
	Layer.provide(DbLive),
);

export const Server = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
	Layer.provide(HttpApiSwagger.layer()),
	Layer.provide(HttpApiBuilder.middlewareOpenApi()),
	Layer.provide(HttpApiBuilder.middlewareCors()),
	Layer.provide(ApiLive),
	HttpServer.withLogAddress,
	Layer.provide(BunHttpServer.layer({})),
);
