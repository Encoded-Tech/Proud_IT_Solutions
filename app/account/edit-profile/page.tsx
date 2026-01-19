  import { getCurrentUserAction } from "@/lib/server/fetchers/fetchUser";
  import ProfileForm from "@/components/client/profileForm";

  export default async function EditProfilePage() {
    const user = await getCurrentUserAction();
    if (!user) return <div className="p-10">Please login</div>;

  

    return (
      <main className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl text-gray-600 font-semibold mb-6">Edit Your Profile Details Here</h1>
          <p className="mb-6 text-gray-500">
    We have pre-filled your profile information below for your convenience. 
    You may review and update any details as needed. <br/> <span className="text-white bg-primary px-2 rounded-xl">Please note that your email address cannot be modified.</span> 
  </p>
        <ProfileForm user={user} />
      </main>
    );
  }
