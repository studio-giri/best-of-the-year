import backgroundUrl from "./background.jpg";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	return (
		<div
			className="fixed inset-0 bg-cover bg-center bg-no-repeat"
			style={{
				backgroundImage: `url(${backgroundUrl})`,
			}}
		>
			<div className="flex h-screen flex-col overflow-y-auto">
				<Header />
				<main className="flex-1">{children}</main>
				<Footer />
			</div>
		</div>
	);
}
