"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  deleteNewsletterSubscribersAction,
  getNewsletterSubscribersAdmin,
  NewsletterSubscriberAdminItem,
  updateNewsletterSubscriberStatusAction,
} from "@/lib/server/actions/admin/customers/emailMarketingActions";
import { AdminTableRevealStyles, getAdminRowReveal } from "@/components/admin/admin-table-reveal";

interface SubscriberSummary {
  total: number;
  subscribed: number;
  unsubscribed: number;
  registeredUsers: number;
  guestSubscribers: number;
}

function formatDate(value: string | Date | null | undefined) {
  return value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
}

function getClientErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function SubscriberTable({
  initialSubscribers,
  initialSummary,
}: {
  initialSubscribers: NewsletterSubscriberAdminItem[];
  initialSummary: SubscriberSummary;
}) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [summary, setSummary] = useState(initialSummary);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [entityType, setEntityType] = useState<"all" | "user" | "guest">("all");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [, setConfirmTarget] = useState<NewsletterSubscriberAdminItem | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    mode: "toggle" | "delete-single" | "delete-selected";
    title: string;
    description: string;
    confirmLabel: string;
    tone: "default" | "danger";
    target?: NewsletterSubscriberAdminItem | null;
  } | null>(null);

  useEffect(() => {
    setSubscribers(initialSubscribers);
    setSummary(initialSummary);
  }, [initialSubscribers, initialSummary]);

  useEffect(() => {
    setSelectedKeys([]);
  }, [search, status, entityType]);

  const loadSubscribers = useCallback(async (overrides?: {
    search?: string;
    status?: "all" | "subscribed" | "unsubscribed";
    entityType?: "all" | "user" | "guest";
  }) => {
    const nextSearch = overrides?.search ?? search;
    const nextStatus = overrides?.status ?? status;
    const nextEntityType = overrides?.entityType ?? entityType;

    try {
      setLoading(true);
      const response = await getNewsletterSubscribersAdmin({
        search: nextSearch,
        subscribed: nextStatus === "all" ? undefined : nextStatus === "subscribed",
        entityType: nextEntityType,
      });

      if (!response.success || !response.data) {
        toast.error(response.message || "Unable to load subscribers.");
        return;
      }

      setSubscribers(response.data.subscribers);
      setSummary(response.data.summary);
    } catch (error) {
      toast.error(getClientErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [entityType, search, status]);

  const keyForSubscriber = (subscriber: NewsletterSubscriberAdminItem) =>
    `${subscriber.entityType}-${subscriber.id}`;

  const allVisibleSelected =
    subscribers.filter((subscriber) => subscriber.entityType === "guest").length > 0 &&
    subscribers
      .filter((subscriber) => subscriber.entityType === "guest")
      .every((subscriber) => selectedKeys.includes(keyForSubscriber(subscriber)));

  const toggleSelection = (subscriber: NewsletterSubscriberAdminItem) => {
    const key = keyForSubscriber(subscriber);
    setSelectedKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedKeys([]);
      return;
    }

    setSelectedKeys(
      subscribers
        .filter((subscriber) => subscriber.entityType === "guest")
        .map((subscriber) => keyForSubscriber(subscriber))
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSubscribers();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadSubscribers]);

  const handleToggle = async (subscriber: NewsletterSubscriberAdminItem) => {
    try {
      setSaving(true);
      const response = await updateNewsletterSubscriberStatusAction({
        entityType: subscriber.entityType,
        id: subscriber.id,
        subscribed: !subscriber.subscribed,
      });

      if (!response.success) {
        toast.error(response.message || "Unable to update subscriber.");
        return;
      }

      setSubscribers((current) =>
        current.map((item) =>
          item.id === subscriber.id && item.entityType === subscriber.entityType
            ? {
                ...item,
                subscribed: !subscriber.subscribed,
                subscribedAt: !subscriber.subscribed ? new Date() : item.subscribedAt,
                unsubscribedAt: !subscriber.subscribed ? null : new Date(),
              }
            : item
        )
      );
      const nextStatus = !subscriber.subscribed && status === "unsubscribed" ? "all" : status;
      if (nextStatus !== status) {
        setStatus(nextStatus);
      }
      toast.success(response.message);
      await loadSubscribers({ status: nextStatus });
      router.refresh();
    } catch (error) {
      toast.error(getClientErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (targets: NewsletterSubscriberAdminItem[]) => {
    try {
      setSaving(true);
      const response = await deleteNewsletterSubscribersAction({
        targets: targets.map((target) => ({
          id: target.id,
          entityType: target.entityType,
        })),
      });

      if (!response.success) {
        toast.error(response.message || "Unable to delete subscribers.");
        return;
      }

      const targetKeys = new Set(targets.map((target) => keyForSubscriber(target)));
      setSelectedKeys((current) => current.filter((key) => !targetKeys.has(key)));
      toast.success(response.message);
      await loadSubscribers();
      router.refresh();
    } catch (error) {
      toast.error(getClientErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <AdminTableRevealStyles />
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              Subscribers
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Newsletter Directory
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review live subscribers collected from registration and the footer newsletter form.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-600">
          Guest subscribers are created from the public footer newsletter form only. If an email belongs to a registered user, it is managed through that registered user record and no separate guest subscriber is kept.
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Subscribed", value: summary.subscribed, tone: "text-emerald-700 bg-emerald-50 border-emerald-100" },
            { label: "Unsubscribed", value: summary.unsubscribed, tone: "text-slate-700 bg-slate-50 border-slate-200" },
            { label: "Registered Users", value: summary.registeredUsers, tone: "text-red-700 bg-red-50 border-red-100" },
            { label: "Guest Subscribers", value: summary.guestSubscribers, tone: "text-amber-700 bg-amber-50 border-amber-100" },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border p-4 ${card.tone}`}>
              <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-black">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, source"
            className="min-w-[220px] flex-1 border-slate-200 bg-slate-50"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm md:w-[170px]"
          >
            <option value="all">All statuses</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as typeof entityType)}
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm md:w-[190px]"
          >
            <option value="all">All types</option>
            <option value="user">Registered users</option>
            <option value="guest">Guest subscribers</option>
          </select>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={toggleSelectAllVisible}
              disabled={loading || subscribers.length === 0}
              className="w-full rounded-lg border-slate-200 sm:w-auto"
            >
              {allVisibleSelected ? "Clear Selection" : "Select All"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving || selectedKeys.length === 0}
              onClick={() => {
                const targets = subscribers.filter((subscriber) =>
                  selectedKeys.includes(keyForSubscriber(subscriber))
                );
                setConfirmConfig({
                  mode: "delete-selected",
                  title: "Delete selected subscribers?",
                  description: `This will remove ${targets.length} selected subscriber${
                    targets.length > 1 ? "s" : ""
                  }. Only guest subscriber records are deleted here.`,
                  confirmLabel: "Delete Selected",
                  tone: "danger",
                });
              }}
              className="w-full rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
            >
              Delete Selected
            </Button>
          </div>
        </div>

        {selectedKeys.length > 0 && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3 text-sm text-red-700">
            {selectedKeys.length} guest subscriber{selectedKeys.length > 1 ? "s" : ""} selected.
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["", "Name", "Email", "Type", "Status", "Source", "Subscribed At", ""].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      Loading subscribers...
                    </td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      No subscribers found for the current filters.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((subscriber, index) => (
                    <tr
                      key={`${subscriber.entityType}-${subscriber.id}`}
                      className="border-t border-slate-100"
                      style={getAdminRowReveal(index)}
                    >
                      <td className="px-4 py-3">
                        {subscriber.entityType === "guest" ? (
                          <input
                            type="checkbox"
                            checked={selectedKeys.includes(keyForSubscriber(subscriber))}
                            onChange={() => toggleSelection(subscriber)}
                            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{subscriber.name}</td>
                      <td className="px-4 py-3 text-slate-600">{subscriber.email}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {subscriber.entityType === "user" ? "Registered User" : "Guest"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            subscriber.subscribed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {subscriber.subscribed ? "Subscribed" : "Unsubscribed"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{subscriber.source}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(subscriber.subscribedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={saving}
                            onClick={() =>
                              setConfirmConfig({
                                mode: "toggle",
                                target: subscriber,
                                title: subscriber.subscribed
                                  ? "Unsubscribe this contact?"
                                  : "Resubscribe this contact?",
                                description: `This will ${
                                  subscriber.subscribed ? "stop" : "restore"
                                } newsletter delivery for ${subscriber.email}.`,
                                confirmLabel: subscriber.subscribed ? "Unsubscribe" : "Resubscribe",
                                tone: subscriber.subscribed ? "danger" : "default",
                              })
                            }
                            className="w-full rounded-lg border-slate-200 sm:w-auto"
                          >
                            {subscriber.subscribed ? "Unsubscribe" : "Resubscribe"}
                          </Button>
                          {subscriber.entityType === "guest" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={saving}
                              onClick={() =>
                                setConfirmConfig({
                                  mode: "delete-single",
                                  target: subscriber,
                                  title: "Delete this subscriber?",
                                  description: `This will permanently delete the guest subscriber record for ${subscriber.email}.`,
                                  confirmLabel: "Delete",
                                  tone: "danger",
                                })
                              }
                              className="w-full rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
                            >
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmConfig)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmTarget(null);
            setConfirmConfig(null);
          }
        }}
        title={confirmConfig?.title || ""}
        description={confirmConfig?.description || ""}
        confirmLabel={confirmConfig?.confirmLabel || "Confirm"}
        tone={confirmConfig?.tone || "default"}
        pending={saving}
        onConfirm={async () => {
          if (!confirmConfig) return;

          if (confirmConfig.mode === "toggle" && confirmConfig.target) {
            await handleToggle(confirmConfig.target);
          }

          if (confirmConfig.mode === "delete-single" && confirmConfig.target) {
            await handleDelete([confirmConfig.target]);
          }

          if (confirmConfig.mode === "delete-selected") {
            const targets = subscribers.filter((subscriber) =>
              selectedKeys.includes(keyForSubscriber(subscriber))
            );
            await handleDelete(targets);
          }

          setConfirmTarget(null);
          setConfirmConfig(null);
        }}
      />
    </section>
  );
}
