import {
	HttpApiBuilder,
	HttpApiSwagger,
	HttpMiddleware,
	HttpServer,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { layer as PgDrizzleLayer } from "@effect/sql-drizzle/Pg";
import { Layer } from "effect";
import { Api } from "./api";
import { PgClientLive } from "./db/PgClient";
import { Env } from "./env";
import { HttpListsLive } from "./lists/handlers";
import { HttpRankingsLive } from "./rankings/handlers";

const DbLive = PgClientLive.pipe(Layer.provide(Env.Live));

const RankingsLive = HttpRankingsLive.pipe(
	Layer.provide(PgDrizzleLayer),
	Layer.provide(DbLive),
);

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
	HttpListsLive,
	RankingsLive,
]);

export const Server = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
	Layer.provide(HttpApiSwagger.layer()),
	Layer.provide(HttpApiBuilder.middlewareOpenApi()),
	Layer.provide(HttpApiBuilder.middlewareCors()),
	Layer.provide(ApiLive),
	HttpServer.withLogAddress,
	Layer.provide(BunHttpServer.layer({})),
);
