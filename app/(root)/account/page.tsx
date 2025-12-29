import Image from "next/image";
import Link from "next/link";
import AccountStats from "@/components/client/AccountStats";
import { AuthUser, IUserAddressFrontend } from "@/redux/features/auth/userSlice";
import { getCurrentUserAction } from "@/lib/server/fetchers/fetchUser";
import { getMyOrderCount } from "@/lib/server/fetchers/fetchOrders";

interface FieldCheck {
  label: string;
  isComplete: boolean;
  message?: string;
  editLink?: string;
}

// Calculate completion percentage and missing fields
function getProfileCompletion(user: AuthUser) {
  const fields: FieldCheck[] = [];

  // Name
  fields.push({
    label: "Name",
    isComplete: Boolean(user.name),
    message: !user.name ? "Provide your name" : undefined,
    editLink: "/account/edit-profile",
  });

  // Email is always present
  fields.push({ label: "Email", isComplete: Boolean(user.email) });

  // Phone
  fields.push({
    label: "Phone",
    isComplete: Boolean(user.phone),
    message: !user.phone ? "Provide your phone number" : undefined,
    editLink: "/account/edit-profile",
  });

  // Bio
  fields.push({
    label: "Bio",
    isComplete: Boolean(user.bio),
    message: !user.bio ? "Add a bio" : undefined,
    editLink: "/account/edit-profile",
  });

  // Image
  fields.push({
    label: "Profile Image",
    isComplete: Boolean(user.image),
    message: !user.image ? "Upload a profile picture" : undefined,
    editLink: "/account/edit-profile",
  });

  // Address fields
  const addr = user.address;
  const addrFields: (keyof IUserAddressFrontend)[] = [
    "fullName",
    "phone",
    "province",
    "district",
    "municipality",
    "ward",
    "street",
    "landmark",
    "postalCode",
    "city",
    "zip",
  ];

  addrFields.forEach((field) => {
    const value = addr?.[field];
    fields.push({
      label: `Address: ${field}`,
      isComplete: Boolean(value),
      message: !value ? `Provide your ${field}` : undefined,
      editLink: "/account/edit-profile",
    });
  });

  // Compute completion percentage
  const totalFields = fields.length;
  const completedFields = fields.filter((f) => f.isComplete).length;
  const completionPercent = Math.round((completedFields / totalFields) * 100);

  // Return completion and missing fields
  const missingFields = fields.filter((f) => !f.isComplete);

  return { completionPercent, missingFields };
}

export default async function AccountOverviewPage() {
  const user = await getCurrentUserAction();
  if (!user) return <p>Unauthorized</p>;

  const { completionPercent, missingFields } = getProfileCompletion(user);

  const {count}  = await getMyOrderCount();

  

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl text-gray-800 font-semibold">
          Welcome to your account{" "}
          <span className="text-white bg-primary px-2 rounded-xl">{user.name}</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s an overview of your account activity and information
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
      

        <div className="flex-1 flex flex-col gap-2">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border">
          <Image
            src={user.image ?? "/default-user.png"}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
          <h2 className="text-lg text-gray-700 font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-600">{user.email}</p>
          {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}

          {/* Profile Completion Bar */}
          <div className="mt-2 w-full">
            <h3 className="text-gray-700 font-medium text-sm mb-1">Profile Completion</h3>
            <div className="w-full bg-gray-200 h-4 rounded-full">
              <div
                className="bg-primary h-4 rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{completionPercent}% completed</p>
          </div>

          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div className="mt-2 text-sm text-red-500 space-y-1">
              <p>Please update the following fields to complete your profile:</p>
              <ul className="list-disc ml-5">
                {missingFields.map((f, i) => (
                  <li key={i}>
                    {f.message}{" "}
                    {f.editLink && (
                      <Link href={f.editLink} className="underline text-primary">
                        Update now
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link
          href="/account/edit-profile"
          className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition self-start md:self-center"
        >
          Edit Profile
        </Link>
      </div>

      <AccountStats count={count} />

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Action
          title="Manage Orders"
          description="View order history and track deliveries"
          href="/account/orders"
        />
        <Action
          title="Security Settings"
          description="Update password and account security"
          href="/account/security"
        />
      </div>
    </div>
  );
}

function Action({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition block"
    >
      <h3 className="font-semibold text-lg text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}
