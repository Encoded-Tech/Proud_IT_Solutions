import Footer from "@/components/layout/footer/page";
import Header from "@/components/layout/header/page";
import LaunchNotice from "@/components/layout/launchNotice";
import { RootLayoutProps } from "@/types/layout";

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <main className="flex flex-col h-screen">
      <LaunchNotice />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  );
}
