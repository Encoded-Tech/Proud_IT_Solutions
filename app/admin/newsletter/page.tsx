import React from "react";
import EmailMarketingPanel from "../users/email-marketing-panel";
import SubscriberTable from "./subscriber-table";
import {
  getEmailMarketingOverview,
  getNewsletterSubscribersAdmin,
} from "@/lib/server/actions/admin/customers/emailMarketingActions";
import { connection } from "next/server";

export default async function AdminNewsletterPage() {
  await connection();
  const overviewResponse = await getEmailMarketingOverview();
  const subscribersResponse = await getNewsletterSubscribersAdmin();

  const overview = overviewResponse.data ?? {
    totalUsers: 0,
    newsletterUsers: 0,
    verifiedUsers: 0,
    guestSubscribers: 0,
    targetOptions: {
      pages: [],
      categories: [],
      brands: [],
      products: [],
    },
    campaigns: [],
  };

  const subscribers = subscribersResponse.data?.subscribers ?? [];
  const summary = subscribersResponse.data?.summary ?? {
    total: 0,
    subscribed: 0,
    unsubscribed: 0,
    registeredUsers: 0,
    guestSubscribers: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
            Newsletter Admin
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Newsletter and Promotions
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage subscribers, run campaigns, and publish promotions to the website.
        </p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              Admin Guide
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            How to run newsletter campaigns
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="font-semibold text-slate-800">1. Review your audience</p>
              <p className="mt-1">
                Use the subscriber directory below to confirm who is subscribed. Registered users are managed from their user account record, while only unique non-user emails are stored as guest subscribers.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="font-semibold text-slate-800">2. Create the campaign</p>
              <p className="mt-1">
                In the campaign composer, write a clear subject, optional preview text, the main message, and an optional CTA button.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="font-semibold text-slate-800">3. Choose where it appears</p>
              <p className="mt-1">
                Keep “Publish this campaign to the public promotions page” enabled if you want the same promotion visible on the website at <code>/promotions</code>.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="font-semibold text-slate-800">4. Confirm before sending</p>
              <p className="mt-1">
                Sending always opens a confirmation dialog. Review the audience carefully before final approval.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-gradient-to-br from-red-600 via-red-700 to-rose-800 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100">
            Operator Notes
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight">
            What each tool is for
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-red-50">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="font-semibold text-white">Campaign Composer</p>
              <p className="mt-1">
                Use this for bulk email campaigns to subscribers, verified users, or all users.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="font-semibold text-white">Subscriber Directory</p>
              <p className="mt-1">
                Use this to view subscription status and unsubscribe or restore delivery for specific contacts. Guest rows are only created for emails that do not belong to a registered user.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="font-semibold text-white">Admin &gt; Users</p>
              <p className="mt-1">
                Use the users area only for account-level support tasks such as reviewing profiles or sending a direct one-to-one message.
              </p>
            </div>
          </div>
        </div>
      </section>

      <EmailMarketingPanel initialOverview={overview} />
      {!overviewResponse.success && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {overviewResponse.message}
        </div>
      )}

      <SubscriberTable initialSubscribers={subscribers} initialSummary={summary} />
      {!subscribersResponse.success && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {subscribersResponse.message}
        </div>
      )}
    </div>
  );
}
