import { IUser } from "@/models/userModel";

export function serializeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role,
    image: user.image ?? "",
    emailVerified: user.emailVerified ?? false,
    bio: user.bio ?? "",
    provider: user.provider ?? undefined,
    providerId: user.providerId ?? undefined,
     hasPassword: Boolean(user.hashedPassword),
    address: user.address
    
      ? {
          fullName: user.address.fullName ?? "",
          phone: user.address.phone ?? "",
          province: user.address.province ?? "",
          district: user.address.district ?? "",
          municipality: user.address.municipality ?? "",
          ward: user.address.ward ?? null,
          street: user.address.street ?? "",
          landmark: user.address.landmark ?? "",
          postalCode: user.address.postalCode ?? "",
          country: user.address.country ?? "",
          city: user.address.city ?? "",
          zip: user.address.zip ?? "",
        }
      : null,
  };
}
