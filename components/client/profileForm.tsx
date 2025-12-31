"use client";

import { useState, useTransition } from "react";
import Image from "next/image";


import { AuthUser, IUserAddressFrontend, setUser } from "@/redux/features/auth/userSlice";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/lib/server/actions/public/user/userProfileAction";


 const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
] as const;

 type NepalProvince = typeof NEPAL_PROVINCES[number];

 const NEPAL_DISTRICTS = [
  "Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Sankhuwasabha",
  "Sunsari", "Taplejung", "Terhathum", "Udayapur", "Bara", "Parsa", "Rautahat", "Sarlahi",
  "Dhading", "Dhankuta", "Gorkha", "Kabhrepalanchok", "Kaski", "Lamjung", "Makwanpur", "Manang",
  "Mustang", "Myagdi", "Nawalpur", "Nuwakot", "Okhaldhunga", "Palpa", "Ramechhap", "Rasuwa",
  "Rolpa", "Rukum East", "Rukum West", "Rupandehi", "Sankhuwasabha", "Saptari", "Sarlahi",
  "Sindhuli", "Sindhupalchok", "Solukhumbu", "Sunsari", "Surkhet", "Syangja", "Tanahun",
  "Taplejung", "Terhathum", "Udayapur", "Baglung", "Baitadi", "Bajhang", "Bajura", "Dadeldhura",
  "Darchula", "Doti", "Achham", "Kailali", "Kanchanpur", "Arghakhanchi", "Banke", "Bardiya",
  "Dang", "Pyuthan", "Rolpa", "Rukum", "Salyan", "Palpa", "Parsa", "Rautahat", "Chitwan",
  "Makwanpur", "Kathmandu", "Bhaktapur", "Lalitpur", "Nuwakot", "Dhading", "Ramechhap", "Sindhupalchok"
] as const;

type NepalDistrict = typeof NEPAL_DISTRICTS[number];

  const placeholders: Record<string, string> = {
    fullName: "e.g., Ram Shrestha or Jon Doe",
    phone: "+977 9801234567",
    municipality: "e.g., Kageshwori Manohara",
    ward: "e.g., 9",
    street: "e.g., Lazimpat Road",
    landmark: "e.g., Near City Hall",
    postalCode: "e.g., 44600",
    city: "e.g., Kathmandu",
    zip: "e.g., 44600",
    bio: "Tell us a bit about yourself (optional)",
  };


interface ProfileFormUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  image?: string;
  address?: Partial<IUserAddressFrontend> | null;
}

interface ProfileFormProps {
  user: ProfileFormUser;
}



export default function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewImage, setPreviewImage] = useState(user.image ?? "/default-user.png");

   const [districtSearch, setDistrictSearch] = useState(user.address?.district ?? "");
   const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  const dispatch = useAppDispatch();

  const router = useRouter();
  /* ---------------- IMAGE PREVIEW ---------------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  /* ---------------- ADDRESS FIELDS ---------------- */
  const addressFields: Array<keyof IUserAddressFrontend> = [
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
  // ---------------- DISTRICTS ----------------


  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

   


    const formData = new FormData(e.currentTarget);

    // ---------------- PHONE VALIDATION ----------------
    const phone = formData.get("phone")?.toString().trim();
    if (phone && !/^\+?\d{7,15}$/.test(phone)) {
      return setMessage({ type: "error", text: "Invalid phone number" });
    }

    // ---------------- IMAGE VALIDATION ----------------
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      if (!["image/png", "image/jpeg", "image/webp"].includes(imageFile.type)) {
        return setMessage({ type: "error", text: "Image must be PNG, JPG, or WEBP" });
      }
      if (imageFile.size > 5_000_000) {
        return setMessage({ type: "error", text: "Image size must be under 5MB" });
      }
    }

    // ---------------- ADDRESS ----------------

const address: Partial<IUserAddressFrontend> = {};

addressFields.forEach((field: keyof IUserAddressFrontend) => {
  const value = formData.get(field)?.toString().trim();
  if (!value) return;

  switch (field) {
    case "ward":
      address.ward = Number(value);
      break;

    case "province":
      if (NEPAL_PROVINCES.includes(value as NepalProvince)) {
        address.province = value as NepalProvince;
      }
      break;

    case "district":
      if (NEPAL_DISTRICTS.includes(value as NepalDistrict)) {
        address.district = value as NepalDistrict;
      }
      break;

    default:
      (address as Omit<Partial<IUserAddressFrontend>, "ward" | "province" | "district">)[field] = value;
  }
});



    if (Object.keys(address).length > 0) formData.set("address", JSON.stringify(address));
    else formData.delete("address");

    startTransition(async () => {

      // Add bio and name to FormData
  const bio = formData.get("bio")?.toString().trim();
  if (bio !== undefined) formData.set("bio", bio);

  const name = formData.get("name")?.toString().trim();
  if (name !== undefined) formData.set("name", name);
      const res = await updateProfileAction(formData);
      if (res.success && res.data) {
        toast.success(res.message);
        dispatch(setUser(res.data as AuthUser));
        router.push("/account");
      setMessage({ type: res.success ? "success" : "error", text: res.message });
      }
      // Update image preview
      if (imageFile && imageFile.size > 0) setPreviewImage(URL.createObjectURL(imageFile));
    });
  };

  return (

<form
  onSubmit={handleSubmit}
  className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
>
  {/* ---------------- PROFILE IMAGE ---------------- */}
  <div className="md:col-span-2 flex flex-col items-center">
    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
      <Image src={previewImage} alt="Profile" fill className="object-cover" />
    </div>
    <label className="mt-3 text-sm text-red-600 cursor-pointer hover:underline">
      Change photo
      <input
        type="file"
        name="image"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleImageChange}
      />
    </label>
  </div>

  {/* ---------------- PERSONAL INFORMATION ---------------- */}
  <div className="md:col-span-2">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          name="name"
          defaultValue={user.name}
          placeholder="Your full name"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none transition duration-200"
        />
      </div>
      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          value={user.email}
          disabled
          className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
        />
      </div>
      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          name="phone"
          defaultValue={user.phone ?? ""}
          placeholder="e.g., +977 9801234567"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none transition duration-200"
        />
      </div>
      {/* Bio */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          name="bio"
          defaultValue={user.bio ?? ""}
          placeholder="e.g., I love gadgets and want the best deals on laptops, TVs, and accessories."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none transition duration-200"
          rows={3}
        />
      </div>
    </div>
  </div>

  {/* ---------------- ADDRESS ---------------- */}
  <div className="md:col-span-2">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">Address</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addressFields.map((field) => {
        // Province dropdown
        if (field === "province") {
          return (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">Province</label>
              <select
                name="province"
                defaultValue={user.address?.province ?? ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none transition duration-200 appearance-none bg-white"
              >
                <option value="" className="text-gray-500">
                  Select Province
                </option>
                {NEPAL_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // District dropdown with search
        if (field === "district") {
          return (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">District</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type to search or click, e.g., Kathmandu"
                  value={districtSearch}
                  onChange={(e) => {
                    setDistrictSearch(e.target.value);
                    setShowDistrictDropdown(true);
                  }}
                  onFocus={() => setShowDistrictDropdown(true)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none transition duration-200"
                  autoComplete="off"
                />
                  <input type="hidden" name="district" value={districtSearch} />
                {showDistrictDropdown && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {NEPAL_DISTRICTS.filter((d) =>
                      d.toLowerCase().includes(districtSearch.toLowerCase())
                    ).map((district) => (
                      <li
                        key={district}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-150"
                        onClick={() => {
                          setDistrictSearch(district);
                          setShowDistrictDropdown(false);
                        }}
                      >
                        {district}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        }

      

        return (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              name={field}
              defaultValue={user.address?.[field] ?? ""}
              placeholder={placeholders[field] ?? ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none transition duration-200"
            />
          </div>
        );
      })}
    </div>
  </div>

  {/* ---------------- ACTION ---------------- */}
  <div className="md:col-span-2 flex items-center gap-4 mt-6">
    <button
      disabled={isPending}
      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
    >
      {isPending ? "Updating..." : "Save Changes"}
    </button>

    {message && (
      <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
        {message.text}
      </p>
    )}
  </div>
</form>

  );
}
