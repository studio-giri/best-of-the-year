/**
 * Spawn a real script with a controlled NODE_ENV and closed stdin, and
 * capture everything it says. runMain may log failures to stdout or stderr
 * depending on the logger, so assertions read the combined output.
 */
export async function spawnTestScript(scriptPath: string, nodeEnv: string) {
	const proc = Bun.spawn(
		[
			"bun",
			scriptPath,
		],
		{
			env: {
				...process.env,
				NODE_ENV: nodeEnv,
			},
			stdin: "ignore",
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	const [exitCode, stdout, stderr] = await Promise.all([
		proc.exited,
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	return {
		exitCode,
		output: stdout + stderr,
	};
}
