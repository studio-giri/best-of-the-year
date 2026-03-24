import { afterAll, beforeAll } from "bun:test";
import { makeTestEnv } from "./make-test-env.ts";

type TestEnv = Awaited<ReturnType<typeof makeTestEnv>>;

/**
 * Registers beforeAll/afterAll hooks for the test environment and returns a
 * getter function to access it.
 *
 * Call once per test file at module scope:
 *
 *   const getEnv = withTestEnv();
 *
 * Then call getEnv() inside each test body (or a nested beforeAll) to
 * destructure handler, runDb, etc. Do NOT destructure at module scope or
 * inside a describe callback — those run during the collection phase, before
 * beforeAll has populated the env.
 */
export function withTestEnv(): () => TestEnv {
	let env: TestEnv;

	beforeAll(async () => {
		env = await makeTestEnv();
	});

	afterAll(async () => {
		await env?.cleanup();
	});

	/**
	 * Return a getter rather than the env directly so that each call
	 * re-reads the variable — by the time a test body executes, beforeAll
	 * has already assigned it.
	 */
	return () => env;
}
