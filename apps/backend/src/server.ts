import {
	HttpApiBuilder,
	HttpApiSwagger,
	HttpMiddleware,
	HttpServer,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Layer } from "effect";
import { Api } from "./api";
import { HttpListsLive } from "./lists/handlers";

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
	HttpListsLive,
]);

export const Server = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
	Layer.provide(HttpApiSwagger.layer()),
	Layer.provide(HttpApiBuilder.middlewareOpenApi()),
	Layer.provide(HttpApiBuilder.middlewareCors()),
	Layer.provide(ApiLive),
	HttpServer.withLogAddress,
	Layer.provide(BunHttpServer.layer({})),
);
