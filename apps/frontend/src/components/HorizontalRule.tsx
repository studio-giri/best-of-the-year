export function HorizontalRule() {
	return (
		<div
			className="h-px w-full"
			style={{
				background:
					"linear-gradient(to right, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.65) 40%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0.10) 100%)",
			}}
		/>
	);
}
