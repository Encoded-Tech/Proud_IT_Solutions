"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { subscribeToNewsletterAction } from "@/lib/server/actions/public/newsletter/newsletterActions";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSubscriptionForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedEmail) {
      toast.error("Email is required for newsletter subscription.");
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("email", normalizedEmail);
        formData.set("name", normalizedName);

        const response = await subscribeToNewsletterAction(formData);

        if (!response.success) {
          toast.error(response.message || "Unable to subscribe right now.");
          return;
        }

        toast.success(response.message || "Subscribed successfully.");
        setEmail("");
        setName("");
      } catch (error) {
        console.error("Newsletter form submission failed:", error);
        toast.error("Something went wrong while subscribing. Please try again.");
      }
    });
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-red-50 p-6 shadow-sm">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-red-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-zinc-200/50 blur-2xl" />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">
          Newsletter
        </p>
        <h4 className="mt-3 text-2xl font-black tracking-tight text-zinc-900">
          Stay close to every drop.
        </h4>
        <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-600">
          Receive launches, limited offers, and store updates before they hit the homepage.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-200"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-200"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Subscribing..." : "Join Newsletter"}
          </button>
        </form>

        <p className="mt-3 text-xs leading-5 text-zinc-500">
          No spam. Only relevant offers and important updates from Proud Nepal.
        </p>
      </div>
    </div>
  );
}
