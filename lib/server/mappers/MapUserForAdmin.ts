import { IUser } from "@/models/userModel";

export const mapUserToAdminDTO = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  image: user.image,
  role: user.role,
  emailVerified: user.emailVerified,
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
  cartCount: user.cart.length,
  wishlistCount: user.wishlist.length,
  buildRequestsCount: user.buildRequests.length,
  lastLogin: user.lastLogin ?? null,
  signupIP: user.signupIP ?? null,
  failedLoginAttempts: user.failedLoginAttempts,
  hardLock: user.hardLock,
  lockCount: user.lockCount,
  isLocked: user.isLocked,
  lastLockTime: user.lastLockTime ?? null,
  loginHistory: user.loginHistory.map((log) => ({
    ip: log.ip,
    userAgent: log.userAgent,
    device: log.device ?? "",
    at: log.at,
    isNewIP: log.isNewIP ?? false,
    isNewDevice: log.isNewDevice ?? false,
    isSuspicious: log.isSuspicious ?? false,
  })), // flatten!
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
