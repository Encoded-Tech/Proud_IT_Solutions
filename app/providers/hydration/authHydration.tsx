"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setUser, clearUser, markHydrated } from "@/redux/user/userSlice";
import { getCurrentUserAction } from "@/lib/server/fetchers/fetchUser";


export default function AuthHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const user = await getCurrentUserAction();

        if (!mounted) return;

        if (user) {
          dispatch(setUser(user));
        } else {
          dispatch(clearUser());
        }
      } catch {
        dispatch(clearUser());
      } finally {
        dispatch(markHydrated());
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return null;
}
