"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { resetPasswordAction } from "@/lib/server/actions/auth/resetPassword";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const data = await resetPasswordAction(token, email, formData.password);
      toast.success(data.message);
      router.replace("/login");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 text-center">
          Enter a new password for <span className="font-medium">{email}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div className="relative">
            <label className="text-sm font-medium">New Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-zinc-200 p-3 outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-muted-foreground hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-zinc-200 p-3 outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-muted-foreground hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-primary text-white rounded-md font-medium flex items-center justify-center gap-2 hover:shadow-lg transition"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
