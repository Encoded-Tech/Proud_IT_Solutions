"use client";
  import { useRef } from "react";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setUser, clearUser, markHydrated } from "@/redux/features/auth/userSlice";
import { getCurrentUserAction } from "@/lib/server/fetchers/fetchUser";

const GoogleSignIn = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { status } = useSession();
  const searchParams = useSearchParams();

  // Hydrate Redux if user is already logged in (after redirect)
  useEffect(() => {
    const hydrateUser = async () => {
      if (status === "authenticated") {
        const user = await getCurrentUserAction();
        if (user) {
          dispatch(setUser(user));
          dispatch(markHydrated());
        } else {
          dispatch(clearUser());
        }
      }
    };
    hydrateUser();
  }, [status, dispatch]);



const toastFired = useRef(false);

useEffect(() => {
  if (toastFired.current) return;

  const error = searchParams.get("error");
  if (!error) return;

  if (error === "EMAIL_ALREADY_REGISTERED_WITH_CREDENTIALS") {
    toast.error(
      "This email is already registered with Email & Password. Please login using credentials."
    );
  } else {
    toast.error("Google login failed. Please try again.");
  }

  toastFired.current = true;
  window.history.replaceState({}, "", window.location.pathname);
}, [searchParams]);


  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/", });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Separator */}
      <div className="flex items-center w-full mb-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-3 text-gray-500 text-sm font-medium">Or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      {/* Google Button */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleGoogleLogin}
        className={`w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg shadow-sm py-3 px-4 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <Icon icon="flat-color-icons:google" width="24" height="24" />
            Sign in with Google
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleSignIn;
