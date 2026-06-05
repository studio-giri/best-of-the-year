import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { Api } from "../api";

export const HttpListsLive = HttpApiBuilder.group(Api, "lists", (handlers) =>
	handlers.handle("findById", ({ params }) =>
		Effect.succeed({
			id: params.id,
			author: "Gerard",
		}),
	),
);
