export const api = {
	get: async (path: string) => {
		const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return res.json();
	},
	post: async (path: string, body: unknown) => {
		const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return res.json();
	},
};
