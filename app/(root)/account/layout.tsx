import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import SidebarLink from "@/components/client/SideBarLink";


export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

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
          <aside className="bg-white rounded-xl shadow p-6 h-fit">
            {/* <h2 className="text-sm font-semibold text-gray-700 mb-6">
              {user.name}&apos;s Account
            </h2> */}

            {/* Section 1: Overview */}
            <div className="mb-6">
              <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
                Account Overview
              </h3>
              <nav className="space-y-1 text-sm">
                <SidebarLink href="/account" label="Overview" />
                <SidebarLink href="/account/edit-profile" label="Edit Profile" />
              </nav>
            </div>

            {/* Section 2: My Activities */}
            <div className="mb-6">
              <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
                My Activities
              </h3>
              <nav className="space-y-1 text-sm">
                <SidebarLink href="/account/orders" label="My Orders" />
                <SidebarLink href="/account/build-request" label="My Build Request" />
                <SidebarLink href="/cart" label="My Cart" />
                <SidebarLink href="/wishlist" label="My Wishlist" />
              </nav>
            </div>

            {/* Section 3: Security */}
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
                Security
              </h3>
              <nav className="space-y-1 text-sm">
                <SidebarLink href="/account/security" label="Security Settings" />
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}


