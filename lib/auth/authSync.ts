"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/redux/hooks";
import { setUser, clearUser } from "@/redux/user/userSlice";

export function useAuthSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      dispatch(
        setUser({
          id: session.user.id,
          name: session.user.name!,
          email: session.user.email!,
          role: session.user.role,
          image: session.user.image,
          emailVerified: session.user.emailVerified,
        })
      );
    }

    if (status === "unauthenticated") {
      dispatch(clearUser());
    }
  }, [status, session, dispatch]);
}
