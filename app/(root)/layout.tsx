import Footer from "@/components/layout/footer/page";
import Header from "@/components/layout/header/page";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </main>
  );
}
