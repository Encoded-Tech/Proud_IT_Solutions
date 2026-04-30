"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { unsubscribeFromNewsletterAction } from "@/lib/server/actions/public/newsletter/newsletterActions";

export default function NewsletterUnsubscribeClient({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUnsubscribe = () => {
    startTransition(async () => {
      try {
        const response = await unsubscribeFromNewsletterAction(token);
        if (!response.success) {
          toast.error(response.message || "Unable to unsubscribe.");
          return;
        }

        toast.success(response.message);
        setDone(true);
      } catch {
        toast.error("Something went wrong while unsubscribing.");
      }
    });
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">
        Email Preferences
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
        Unsubscribe from newsletter emails
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
        Confirm if you no longer want promotions, launches, and store updates from Proud IT Solutions.
      </p>

      <div className="mt-6">
        {done ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            You have been unsubscribed successfully.
          </div>
        ) : (
          <button
            onClick={handleUnsubscribe}
            disabled={isPending}
            className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? "Unsubscribing..." : "Confirm Unsubscribe"}
          </button>
        )}
      </div>
    </div>
  );
}
