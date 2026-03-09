import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api } from "../api";

export const HttpListsLive = HttpApiBuilder.group(Api, "lists", (handlers) =>
	handlers.handle("findById", ({ path }) =>
		Effect.succeed({
			id: path.id,
			author: "Gerard",
		}),
	),
);
