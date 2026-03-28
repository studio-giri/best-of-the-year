import backgroundUrl from "./background.jpg";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	return (
		<div
			className="min-h-screen bg-cover bg-center bg-no-repeat"
			style={{
				backgroundImage: `url(${backgroundUrl})`,
			}}
		>
			<main>{children}</main>
		</div>
	);
}
