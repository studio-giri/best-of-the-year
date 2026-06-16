import { defineConfig } from "drizzle-kit";

/**
 * Retrieve DATABASE_URL
 */
// biome-ignore lint/complexity/useLiteralKeys: noPropertyAccessFromIndexSignature requires bracket notation
const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
	throw new Error("DATABASE_URL is not set");
}

/**
 * Drizzle CLI (dev-tool) configuration
 */
export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl,
	},
});
