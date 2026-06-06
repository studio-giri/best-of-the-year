import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * Standalone vitest config — deliberately NOT reusing vite.config.ts: the
 * TanStack Start plugin stack (SSR server, router codegen, devtools) is
 * unnecessary for unit tests. Tests only need the JSX transform and the
 * #/* path alias.
 */
export default defineConfig({
	plugins: [
		tsconfigPaths({
			projects: [
				"./tsconfig.json",
			],
		}),
		viteReact(),
	],
	test: {
		environment: "jsdom",
		include: [
			"src/**/*.test.{ts,tsx}",
		],
	},
});
