"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");

        // ✅ Handle unverified email
        if (data.email && data.expiresAt) {
          router.replace(
            `/verify-email?email=${encodeURIComponent(
              data.email
            )}&expiresAt=${data.expiresAt}`
          );
        }
        return;
      }

      // ✅ Successful login
      toast.success(data.message || "Login successful");

      // redirect based on role if needed
      if (data.data?.user?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/"); // normal user
      }
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full overflow-hidden bg-white p-4 rounded-md shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs border w-full"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-xs font-medium text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs border w-full"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-500">{errors.password}</p>
          )}
        </div>

    <button
  type="submit"
  className="w-full h-11 bg-primary rounded-md text-white font-medium transition-all duration-200 hover:shadow-md hover:translate-y-[-1px] flex items-center justify-center gap-2"
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Signing in...
    </>
  ) : (
    "Sign in"
  )}
</button>

      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
         {" Don't"} have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-4">
        <button
          className="w-full h-11 transition-all duration-200 flex justify-center items-center shadow-sm rounded-md border border-zinc-200"
          disabled={isLoading}
          onClick={() => signIn("google")}
        >
          <Icon icon="flat-color-icons:google" width="24" height="24" />
          <span className="sr-only">Google</span>
        </button>
      </div>
    </div>
  );
}
