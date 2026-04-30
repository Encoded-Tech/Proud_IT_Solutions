"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getEmailMarketingOverview,
  sendBulkEmailCampaignAction,
} from "@/lib/server/actions/admin/customers/emailMarketingActions";

interface MarketingOverview {
  totalUsers: number;
  newsletterUsers: number;
  verifiedUsers: number;
  guestSubscribers: number;
  targetOptions: {
    pages: { value: string; label: string; path: string }[];
    categories: { value: string; label: string; path: string }[];
    brands: { value: string; label: string; path: string }[];
    products: { value: string; label: string; path: string }[];
  };
  campaigns: {
    id: string;
    subject: string;
    slug: string;
    audience: string;
    status: string;
    recipientCount: number;
    successCount: number;
    failureCount: number;
    publishedToSite: boolean;
    targetType?: "none" | "page" | "category" | "brand" | "product";
    targetLabel?: string | null;
    targetPath?: string | null;
    createdAt: string | Date;
  }[];
}

interface EmailMarketingPanelProps {
  initialOverview: MarketingOverview;
}

const audienceLabels: Record<string, string> = {
  "all-users": "All users",
  "verified-users": "Verified users",
  "newsletter-users": "Newsletter users",
  "newsletter-users-and-guests": "Newsletter users + guest subscribers",
  "guest-subscribers": "Guest subscribers",
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getClientErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function EmailMarketingPanel({
  initialOverview,
}: EmailMarketingPanelProps) {
  const campaignsPerPage = 4;
  const [overview, setOverview] = useState(initialOverview);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    subject: "",
    previewText: "",
    audience: "newsletter-users-and-guests",
    body: "",
    ctaLabel: "",
    targetType: "none",
    targetValue: "",
    publishToSite: true,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [campaignPage, setCampaignPage] = useState(1);

  useEffect(() => {
    setOverview(initialOverview);
  }, [initialOverview]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(overview.campaigns.length / campaignsPerPage));
    setCampaignPage((current) => Math.min(current, totalPages));
  }, [overview.campaigns.length]);

  const refreshOverview = async () => {
    try {
      const response = await getEmailMarketingOverview();

      if (!response.success || !response.data) {
        toast.error(response.message || "Unable to refresh campaign overview.");
        return;
      }

      setOverview(response.data);
    } catch (error) {
      toast.error(getClientErrorMessage(error));
    }
  };

  const submitCampaign = () => {
    setConfirmOpen(false);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("subject", form.subject.trim());
        formData.set("previewText", form.previewText.trim());
        formData.set("audience", form.audience);
        formData.set("body", form.body.trim());
        formData.set("ctaLabel", form.ctaLabel.trim());
        formData.set("targetType", form.targetType);
        formData.set("targetValue", form.targetValue);
        formData.set("publishToSite", form.publishToSite ? "true" : "false");

        const response = await sendBulkEmailCampaignAction(formData);

        if (!response.success) {
          toast.error(response.message || "Campaign could not be sent.");
          return;
        }

        toast.success(response.message || "Campaign sent successfully.");
        setForm((current) => ({
          ...current,
          subject: "",
          previewText: "",
          body: "",
          ctaLabel: "",
          targetType: "none",
          targetValue: "",
          publishToSite: true,
        }));
        await refreshOverview();
      } catch (error) {
        toast.error(getClientErrorMessage(error));
      }
    });
  };

  const handleSubmit = () => {
    const normalizedSubject = form.subject.trim();
    const normalizedBody = form.body.trim();

    if (normalizedSubject.length < 3) {
      toast.error("Subject must be at least 3 characters.");
      return;
    }

    if (normalizedBody.length < 10) {
      toast.error("Email body must be at least 10 characters.");
      return;
    }

    if (form.targetType !== "none" && !form.targetValue) {
      toast.error("Select the campaign destination before sending.");
      return;
    }
    setConfirmOpen(true);
  };

  const targetOptions =
    form.targetType === "page"
      ? overview.targetOptions.pages
      : form.targetType === "category"
        ? overview.targetOptions.categories
        : form.targetType === "brand"
          ? overview.targetOptions.brands
          : form.targetType === "product"
            ? overview.targetOptions.products
            : [];

  const selectedTarget = targetOptions.find((option) => option.value === form.targetValue);
  const totalCampaignPages = Math.max(1, Math.ceil(overview.campaigns.length / campaignsPerPage));
  const visibleCampaigns = useMemo(() => {
    const start = (campaignPage - 1) * campaignsPerPage;
    return overview.campaigns.slice(start, start + campaignsPerPage);
  }, [campaignPage, overview.campaigns]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
            Email Marketing
          </span>
        </div>
        <h2 className="text-xl font-black tracking-tight text-slate-900">
          Campaign Composer
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Send targeted updates to all users, verified users, or newsletter audiences in one place.
        </p>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Send this campaign?"
        description={`This will send "${form.subject.trim()}" to ${audienceLabels[form.audience]}. ${
          form.publishToSite ? "It will also be published on the public promotions page." : "It will remain email-only."
        }${selectedTarget ? ` Linked destination: ${selectedTarget.label}.` : ""}`}
        confirmLabel="Send Campaign"
        pending={isPending}
        onConfirm={submitCampaign}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "All Users", value: overview.totalUsers },
          { label: "Newsletter Users", value: overview.newsletterUsers },
          { label: "Verified Users", value: overview.verifiedUsers },
          { label: "Guest Subscribers", value: overview.guestSubscribers },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Subject
              </label>
              <Input
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="April promotions, store updates, product launch..."
                className="border-slate-200 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Preview Text
              </label>
              <Input
                value={form.previewText}
                onChange={(e) => setForm((prev) => ({ ...prev, previewText: e.target.value }))}
                placeholder="Short snippet shown in email inbox previews"
                className="border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Campaign Target
              </label>
              <select
                value={form.targetType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    targetType: e.target.value,
                    targetValue: "",
                  }))
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200"
              >
                <option value="none">No destination link</option>
                <option value="page">Site page</option>
                <option value="category">Shop category</option>
                <option value="brand">Brand page</option>
                <option value="product">Product page</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Destination
              </label>
              <select
                value={form.targetValue}
                onChange={(e) => setForm((prev) => ({ ...prev, targetValue: e.target.value }))}
                disabled={form.targetType === "none"}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {form.targetType === "none" ? "No destination selected" : "Select destination"}
                </option>
                {targetOptions.map((option) => (
                  <option key={`${form.targetType}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Audience
              </label>
              <select
                value={form.audience}
                onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200"
              >
                {Object.entries(audienceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Message
              </label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Write the body in plain text. Paragraph breaks are preserved in the email template."
                rows={9}
                className="border-slate-200 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                CTA Label
              </label>
              <Input
                value={form.ctaLabel}
                onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                placeholder={
                  form.targetType === "none"
                    ? "Optional button label"
                    : "Optional button label. A default will be used if left empty."
                }
                className="border-slate-200 bg-white"
              />
            </div>

            {selectedTarget && (
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Destination Preview
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selectedTarget.label}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{selectedTarget.path}</p>
              </div>
            )}

            <label className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.publishToSite}
                onChange={(e) => setForm((prev) => ({ ...prev, publishToSite: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              Publish this campaign to the public promotions page
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Audience target:{" "}
              <span className="font-semibold text-slate-700">
                {audienceLabels[form.audience]}
              </span>
            </p>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 sm:w-auto"
            >
              {isPending ? "Sending..." : "Send Campaign"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Recent Campaigns
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refreshOverview()}
              className="w-full rounded-lg border-slate-200 sm:w-auto"
            >
              Refresh
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {overview.campaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-400">
                No campaigns sent yet.
              </div>
            ) : (
              visibleCampaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{campaign.subject}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {audienceLabels[campaign.audience] || campaign.audience}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        campaign.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : campaign.status === "partial"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>{campaign.recipientCount} recipients</span>
                    <span>{campaign.successCount} sent</span>
                    <span>{campaign.failureCount} failed</span>
                    <span>{campaign.publishedToSite ? "Public" : "Email only"}</span>
                    {campaign.targetLabel && <span>Target: {campaign.targetLabel}</span>}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(campaign.createdAt)}</p>
                </div>
              ))
            )}
          </div>

          {overview.campaigns.length > campaignsPerPage && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">
                Page <span className="font-semibold text-slate-700">{campaignPage}</span> of{" "}
                <span className="font-semibold text-slate-700">{totalCampaignPages}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCampaignPage((page) => Math.max(1, page - 1))}
                  disabled={campaignPage === 1}
                  className="rounded-lg border-slate-200"
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCampaignPage((page) => Math.min(totalCampaignPages, page + 1))
                  }
                  disabled={campaignPage === totalCampaignPages}
                  className="rounded-lg border-slate-200"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
