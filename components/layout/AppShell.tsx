import Footer from "./footer/page";
import Header from "./header/page";

;

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex flex-col h-screen">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
    </>
  );
}
