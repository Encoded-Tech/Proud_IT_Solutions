"use client";

import type React from "react";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import {  useFormStatus } from "react-dom";
import {
  registerAction,
  type RegisterState,
} from "@/lib/server/actions/auth/register";
import GoogleSignIn from "@/components/client/GoogleLogin";

const initialState: RegisterState = {};

export default function RegisterForm() {
  
  const [state, formAction] = useActionState(registerAction, initialState);


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hashedPassword: "",
    confirmPassword: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    hashedPassword: "",
    confirmPassword: "",
    phone: "",
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

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
      valid = false;
    }

    if (!formData.hashedPassword) {
      newErrors.hashedPassword = "Password is required";
      valid = false;
    } else if (formData.hashedPassword.length < 8) {
      newErrors.hashedPassword = "Password must be at least 8 characters";
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (formData.hashedPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  return (
    <div className="w-full bg-white p-4 rounded-md shadow-sm">
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!validateForm()) e.preventDefault();
        }}
        className="space-y-4"
      >
        {/* SERVER ERROR */}
        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {state.error}
          </p>
        )}

        {/* Name */}
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          error={errors.name}
          onChange={handleChange}
        />

        {/* Email */}
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          error={errors.email}
          onChange={handleChange}
        />

        {/* Phone */}
        <Input
          label="Phone"
          name="phone"
          value={formData.phone}
          error={errors.phone}
          onChange={handleChange}
        />

        {/* Password */}
        <PasswordInput
          label="Password"
          name="hashedPassword"
          value={formData.hashedPassword}
          error={errors.hashedPassword}
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          onChange={handleChange}
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          error={errors.confirmPassword}
          show={showConfirmPassword}
          toggle={() => setShowConfirmPassword(!showConfirmPassword)}
          onChange={handleChange}
        />

        <SubmitButton />
      </form>

 

      <p className="mt-6 text-sm text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium">
          Sign in
        </Link>
      </p>

           {/* OAuth */}
   <GoogleSignIn />
    </div>
  );
}

/* ---------- REUSABLE INPUTS ---------- */

function Input({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input {...props} className="w-full p-3 border rounded-lg" />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function PasswordInput({
  label,
  show,
  toggle,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  show: boolean;
  toggle: () => void;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full p-3 border rounded-lg"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ---------- SUBMIT BUTTON ---------- */

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 bg-primary text-white rounded-md"
    >
      {pending ? "Creating account..." : "Create account"}
    </button>
  );
}
