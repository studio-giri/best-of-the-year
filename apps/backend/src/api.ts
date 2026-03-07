import { HttpApi, OpenApi } from "@effect/platform";
import { ListsApi } from "./lists/api.ts";

export class Api extends HttpApi.make("api")
	.add(ListsApi)
	.annotate(OpenApi.Title, "Best Of The Year API")
	.annotate(OpenApi.Version, "1.0.0") {}
