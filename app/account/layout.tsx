import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import SidebarLink from "@/components/client/SideBarLink";

import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

            {/* SIDEBAR */}
            <aside className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24 h-fit">
              <div className="mb-8">
                <p className="text-sm text-gray-500">Welcome</p>
                <h2 className="font-semibold text-gray-800 truncate">
                  {session.user.name}
                </h2>
              </div>

              <div className="space-y-8">

                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                    Account
                  </h3>
                  <nav className="space-y-1 text-sm">
                    <SidebarLink href="/account" label="Overview" />
                    <SidebarLink href="/account/edit-profile" label="Edit Profile" />
                  </nav>
                </section>

                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                    Activities
                  </h3>
                  <nav className="space-y-1 text-sm">
                    <SidebarLink href="/account/orders" label="Orders" />
                    <SidebarLink href="/account/build-requests" label="Build Requests" />
                    <SidebarLink href="/cart" label="Cart" />
                    <SidebarLink href="/wishlist" label="Wishlist" />
                  </nav>
                </section>

                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                    Security
                  </h3>
                  <nav className="space-y-1 text-sm">
                    <SidebarLink href="/account/security" label="Security" />
                  </nav>
                </section>

              </div>
            </aside>

            {/* CONTENT */}
            <section className="min-w-0">
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                {children}
              </div>
            </section>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
