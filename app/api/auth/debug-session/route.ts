import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const session = await auth();

  return NextResponse.json({
    authenticated: Boolean(session?.user?.id),
    user: session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          emailVerified: session.user.emailVerified,
          hasImage: Boolean(session.user.image),
          hasPassword: Boolean(session.user.hasPassword),
        }
      : null,
  });
}
