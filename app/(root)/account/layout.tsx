import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import SidebarLink from "@/components/client/SideBarLink";


export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  

  const user = session?.user;

  if (!session?.user) {
    return <div className="p-10">Please login</div>;
  }

  return (
    <div className=" bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div
          className="
            grid gap-8
            lg:grid-cols-[260px_1fr]
          "
        >
          {/* SIDEBAR */}
          <aside className="bg-white rounded-xl shadow p-4 h-fit">
            <h2 className="text-sm font-semibold text-gray-400 px-4 mb-4">
              {user.name}&apos;s Account
            </h2>

            <nav className="space-y-1 text-sm">
              <SidebarLink href="/account" label="Overview" />
              <SidebarLink href="/account/edit-profile" label="Edit Profile" />
              <SidebarLink href="/account/orders" label="Orders" />
              <SidebarLink href="/cart" label="Cart" />
              <SidebarLink href="/wishlist" label="Wishlist" />
              <SidebarLink href="/account/security" label="Security" />
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}


