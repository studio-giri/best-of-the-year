import { BunRuntime } from "@effect/platform-bun";
import { Layer } from "effect";
import { Server } from "./server.ts";

Server.pipe(Layer.launch, BunRuntime.runMain);
