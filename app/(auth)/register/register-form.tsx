"use client";
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = "First name is required";
      valid = false;
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Login failed:", data.message || data.error);
        toast.error(data.message || data.error);
        return;
      }
      toast.success("Registration Successfull");
      router.push(`verifyEmail?email=${encodeURIComponent(data.data.email)}`);
    } catch (error) {
      console.error("Registration failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full overflow-hidden bg-white p-4 rounded-md shadow-sm">
      <div className="relative space-y-6 ">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="John"
              autoComplete="given-name"
              value={formData.name}
              onChange={handleChange}
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs font-medium text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              ConfirmPassword
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs  border w-full"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-primary rounded-md text-white font-medium transition-all duration-200 hover:shadow-md hover:translate-y-[-1px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="relative">
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative text-xs uppercase">
            <button
              className="w-full h-11 transition-all duration-200 flex justify-center items-center shadow-sm rounded-md border border-zinc-200"
              disabled={isLoading}
            >
              <Icon icon="flat-color-icons:google" width="24" height="24" />
              <span className="sr-only">Google</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex justify-center mt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/login`}
            className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
