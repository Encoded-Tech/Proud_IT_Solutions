
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

export async function requireSession(options?: {
  roles?: ("admin" | "user")[];
  emailVerified?: boolean;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (options?.emailVerified && !session.user.emailVerified) {
    throw new Error("Email not verified");
  }

  if (options?.roles && !options.roles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }

  return session.user;
}

export async function requireUser() {
  return requireSession({
    roles: ["user"],
    emailVerified: true,
  });
}

export async function requireAdmin() {
  return requireSession({
    roles: ["admin"],
    emailVerified: true,
  })
}