
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireSession(options?: {
  roles?: ("admin" | "user")[];
  emailVerified?: boolean;
}) {
  const session = await auth();

  if (!session?.user?.id) {
  redirect("/login");
  }

  if (options?.emailVerified && !session.user.emailVerified) {
       redirect("/verify-email");
  }

  if (options?.roles && !options.roles.includes(session.user.role)) {
    redirect("/unauthorized"); 
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
