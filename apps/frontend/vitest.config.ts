import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Standalone vitest config — deliberately NOT reusing vite.config.ts: the
 * TanStack Start plugin stack (SSR server, router codegen, devtools) is
 * unnecessary for unit tests.
 */
export default defineConfig({
	plugins: [
		viteReact(),
	],
	test: {
		environment: "jsdom",
		include: [
			"src/**/*.test.{ts,tsx}",
		],
	},
});
