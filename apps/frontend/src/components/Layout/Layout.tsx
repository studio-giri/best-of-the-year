import backgroundUrl from "./background.jpg";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	return (
		<div
			className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat"
			style={{
				backgroundImage: `url(${backgroundUrl})`,
			}}
		>
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
