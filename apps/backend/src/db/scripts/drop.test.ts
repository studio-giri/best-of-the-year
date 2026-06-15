import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { spawnTestScript } from "./spawn-test-script.ts";

/**
 * Black-box process tests — see truncate.test.ts for the full rationale:
 * the process boundary is the script's only seam, and the guarded property
 * ("running drop.ts against production exits non-zero before touching
 * anything") belongs to the artifact, not to a helper.
 */

const SCRIPT = join(import.meta.dir, "drop.ts");

describe("db:drop safety guards", () => {
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
		 * the literal "drop" must cancel before DATABASE_URL is even read
		 */
		const { exitCode, output } = await spawnTestScript(SCRIPT, "test");
		expect(exitCode).not.toBe(0);
		expect(output).toContain("Drop cancelled");
	});
});
