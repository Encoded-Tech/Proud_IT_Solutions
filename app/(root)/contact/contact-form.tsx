"use client";

import React, { useState } from "react";

import { ContactFormData } from "@/lib/validations/Zod";
import { submitContactForm } from "@/lib/server/actions/public/contact/contactAction";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated, selectUser } from "@/redux/features/auth/userSlice";

export default function ContactForm() {
  const [formData, setFormData] = useState<Partial<ContactFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const user = useAppSelector(selectUser);
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const isAdmin = isLoggedIn && user?.role === "admin";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    if (isAdmin) {
      toast.error("You are admin don't submit contact form");
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage(null);

    const response = await submitContactForm(formData);

    if (response.success) {
      setSuccessMessage(response.message);
      setFormData({});
      toast.success(response.message);
    } else if (response.errors) {
      const fieldErrors: Record<string, string> = {};
     if (response.errors) {
  (Object.keys(response.errors) as Array<keyof ContactFormData>).forEach((key) => {
    const errorItem = response.errors![key];
    if (errorItem && "_errors" in errorItem && errorItem._errors.length > 0) {
      fieldErrors[key] = errorItem._errors.join(", ");
    }
  });
}
      setErrors(fieldErrors);
      toast.error(response.message);
    } else {
      setErrors({ general: response.message || "Something went wrong" });
    }

    setLoading(false);
  };

  return (
    <main className="grid lg:grid-cols-2 grid-cols-1 gap-6 md:p-4 p-2 md:my-24 my-10">
      <div className="space-y-6 overflow-hidden">
        <h2 className="font-semibold capitalize md:text-2xl text-xl">
          Get in Touch
        </h2>
        <p className="md:text-base text-sm text-zinc-500">
          We are an independently owned and officially authorized full-service
          tour operator based in Kathmandu, Nepal.
        </p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.4764581012696!2d85.31973007535768!3d27.702571776185334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190068981201%3A0x57a04923de17fa78!2sProud%20Nepal%20IT%20Suppliers%20Pvt%20Ltd!5e0!3m2!1sen!2snp!4v1758092155921!5m2!1sen!2snp"
          loading="lazy"
          height="full"
          className="w-full h-full mx-auto rounded-lg shadow-md"
        ></iframe>
      </div>

      <div className="space-y-6 bg-zinc-50 rounded-lg md:p-6 p-2">
        <h2 className="font-semibold capitalize md:text-2xl text-xl">
          Fill up the form
        </h2>
        <p className="md:text-base text-xs text-lighttext">
          Your email address will not be published. Required fields are marked
        </p>

        {errors.general && (
          <p className="text-red-600 font-medium">{errors.general}</p>
        )}
        {successMessage && (
          <p className="text-green-600 font-medium">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="!mt-10 space-y-4">
          <div className="flex w-full gap-4 items-center">
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name || ""}
              onChange={handleChange}
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs border w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="john@gmail.com"
              value={formData.email || ""}
              onChange={handleChange}
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs border w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          <div className="flex w-full gap-4 items-center">
            <input
              type="text"
              name="phone"
              placeholder="+977-9800000000"
              value={formData.phone || ""}
              onChange={handleChange}
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs border w-full"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs">{errors.phone}</p>
            )}

            <input
              type="text"
              name="organization"
              placeholder="Organization (optional)"
              value={formData.organization || ""}
              onChange={handleChange}
              className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs border w-full"
            />
            {errors.organization && (
              <p className="text-red-500 text-xs">{errors.organization}</p>
            )}
          </div>

          <textarea
            name="description"
            placeholder="Hello, I want to state..."
            rows={10}
            value={formData.description || ""}
            onChange={handleChange}
            className="md:p-3 p-2 rounded-lg border-zinc-200 bg-white outline-none md:text-sm text-xs border w-full"
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary rounded-md p-2 text-white text-sm font-medium"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
}
