import { BunRuntime } from "@effect/platform-bun";
import { Layer } from "effect";
import { Server } from "./server";

Server.pipe(Layer.launch, BunRuntime.runMain);
