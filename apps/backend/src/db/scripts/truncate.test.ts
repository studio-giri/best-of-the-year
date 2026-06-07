import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { spawnTestScript } from "./spawn-test-script";

/**
 * Black-box process tests — deliberately closer to integration tests than
 * unit tests:
 *
 * - truncate.ts calls BunRuntime.runMain at module level, so importing it
 *   from a test would EXECUTE the script (prompt, DB connection). The process
 *   boundary is the script's only seam — and its natural one.
 * - The property we care about belongs to the artifact, not to a helper:
 *   "running truncate.ts against production exits non-zero before touching
 *   anything". Extracting the guard and unit-testing it could stay green
 *   even if the script stopped calling it; spawning the real script cannot
 *   be fooled that way.
 *
 * They still belong in the (cached, hermetic) unit suite: both paths fail
 * before DATABASE_URL is even read — no DB, no network, deterministic.
 */

const SCRIPT = join(import.meta.dir, "truncate.ts");

describe("db:truncate safety guards", () => {
	test.each([
		"production",
		"prod",
	])("refuses to run when NODE_ENV=%s", async (nodeEnv) => {
		const { exitCode, output } = await spawnTestScript(SCRIPT, nodeEnv);
		expect(exitCode).not.toBe(0);
		expect(output).toContain("cannot be run in production");
	});

	test("aborts when the confirmation prompt is not answered", async () => {
		/**
		 * stdin is closed ("ignore"), so prompt() returns null — anything but
		 * the literal "truncate" must cancel before DATABASE_URL is even read
		 */
		const { exitCode, output } = await spawnTestScript(SCRIPT, "test");
		expect(exitCode).not.toBe(0);
		expect(output).toContain("Truncate cancelled");
	});
});
