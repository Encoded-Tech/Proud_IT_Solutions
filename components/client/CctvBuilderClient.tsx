"use client";

import Image from "@/components/ui/optimized-image";
import {
  CCTV_PART_LABELS,
  CCTV_PART_TYPES,
  CctvPartType,
  REQUIRED_CCTV_PART_TYPES,
} from "@/constants/cctv";
import { submitCctvInstallationRequest } from "@/lib/server/actions/public/cctv/cctvActions";
import { CctvPartMapped } from "@/lib/server/mappers/MapCctv";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthenticated, selectUser } from "@/redux/features/auth/userSlice";
import {
  Camera,
  CheckCircle2,
  HardDrive,
  Monitor,
  Network,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { JSX, useMemo, useState } from "react";
import toast from "react-hot-toast";

type SelectedCctvItem = {
  part: CctvPartMapped;
  quantity: number;
  notes?: string;
};

interface Props {
  parts: CctvPartMapped[];
}

const ICONS: Record<CctvPartType, JSX.Element> = {
  camera: <Camera className="h-5 w-5" />,
  nvr: <ShieldCheck className="h-5 w-5" />,
  poe_switch: <Network className="h-5 w-5" />,
  hdd_storage: <HardDrive className="h-5 w-5" />,
  cat6_rj45_wire: <Network className="h-5 w-5" />,
  networking_box: <Package className="h-5 w-5" />,
  monitor: <Monitor className="h-5 w-5" />,
  junction_box: <Package className="h-5 w-5" />,
  installation_service: <Wrench className="h-5 w-5" />,
  accessories: <ShoppingBag className="h-5 w-5" />,
};

function money(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function CctvBuilderClient({ parts }: Props) {
  const router = useRouter();
  const isLoggedIn = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [activeType, setActiveType] = useState<CctvPartType>("camera");
  const [selected, setSelected] = useState<Record<string, SelectedCctvItem>>({});
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    siteAddress: "",
    notes: "",
  });

  const grouped = useMemo(() => {
    return parts.reduce<Record<CctvPartType, CctvPartMapped[]>>((acc, part) => {
      acc[part.type] = acc[part.type] || [];
      acc[part.type].push(part);
      return acc;
    }, {} as Record<CctvPartType, CctvPartMapped[]>);
  }, [parts]);

  const selectedItems = Object.values(selected);
  const total = selectedItems.reduce(
    (sum, item) => sum + item.part.price * item.quantity,
    0
  );
  const requiredComplete = REQUIRED_CCTV_PART_TYPES.every((type) =>
    selectedItems.some((item) => item.part.type === type)
  );

  const selectPart = (part: CctvPartMapped) => {
    setSelected((current) => ({
      ...current,
      [part.id]: current[part.id] || { part, quantity: 1 },
    }));
  };

  const updateQuantity = (partId: string, quantity: number) => {
    setSelected((current) => {
      const item = current[partId];
      if (!item) return current;
      return {
        ...current,
        [partId]: {
          ...item,
          quantity: Math.max(1, Math.floor(quantity || 1)),
        },
      };
    });
  };

  const removeItem = (partId: string) => {
    setSelected((current) => {
      const next = { ...current };
      delete next[partId];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.error("Please login first");
      router.push("/login?redirect=/install-cctv");
      return;
    }

    if (!selectedItems.length) {
      toast.error("Select at least one CCTV item");
      return;
    }

    if (!requiredComplete) {
      toast.error("Please select the required CCTV package items");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCctvInstallationRequest({
        items: selectedItems.map((item) => ({
          partId: item.part.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
        customerDetails: details,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      router.push("/account/cctv-installations");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit CCTV installation request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
              CCTV installation
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 md:text-5xl">
              Install CCTV Cameras
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Choose cameras, recorder, storage and networking accessories to build your CCTV
              installation package.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full border bg-white px-4 py-2">Server-trusted pricing</span>
              <span className="rounded-full border bg-white px-4 py-2">Site notes included</span>
              <span className="rounded-full border bg-white px-4 py-2">Admin review after request</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-600 p-3">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Your CCTV Package</h2>
                <p className="text-sm text-slate-300">Estimated total updates as you select items.</p>
              </div>
            </div>
            <div className="mt-8 text-4xl font-semibold">{money(total)}</div>
            <p className="mt-3 text-sm text-slate-300">
              Final installation cost may vary after site inspection if extra cable routing,
              height work, or civil work is required.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr_360px]">
        <aside className="h-fit rounded-xl border bg-white p-3 shadow-sm lg:sticky lg:top-28">
          <h2 className="px-2 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Select Items
          </h2>
          <div className="space-y-1">
            {CCTV_PART_TYPES.filter((type) => type !== "accessories" || grouped[type]?.length).map((type) => {
              const count = grouped[type]?.length || 0;
              const done = selectedItems.some((item) => item.part.type === type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                    activeType === type
                      ? "bg-red-50 text-red-700 ring-1 ring-red-100"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {ICONS[type]}
                    <span className="truncate">{CCTV_PART_LABELS[type]}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs">
                    {done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {CCTV_PART_LABELS[activeType]}
                </h2>
                <p className="text-sm text-slate-500">
                  Select one or more items and set quantities in the summary.
                </p>
              </div>
              {REQUIRED_CCTV_PART_TYPES.includes(activeType) && (
                <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  Required
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(grouped[activeType] || []).length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed bg-white p-10 text-center text-slate-500">
                No active CCTV items are available for this category yet.
              </div>
            ) : (
              grouped[activeType].map((part) => {
                const isSelected = Boolean(selected[part.id]);
                return (
                  <article
                    key={part.id}
                    className={`overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
                      isSelected ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {part.imageUrl ? (
                        <Image
                          src={part.imageUrl}
                          alt={part.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Camera className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          {[part.brand, part.modelName].filter(Boolean).join(" / ") ||
                            part.typeLabel}
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-slate-950">{part.name}</h3>
                        {part.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                            {part.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-950">{money(part.price)}</span>
                        <button
                          type="button"
                          onClick={() => selectPart(part)}
                          disabled={isSelected}
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-primary text-white hover:bg-primary/90"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Your CCTV Package</h2>
            {selectedItems.length === 0 ? (
              <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                Select CCTV items to build your installation package.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {selectedItems.map((item) => (
                  <div key={item.part.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500">{item.part.typeLabel}</p>
                        <h3 className="text-sm font-semibold text-slate-900">{item.part.name}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.part.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${item.part.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuantity(item.part.id, Number(event.target.value))
                        }
                        className="h-9 w-20 rounded-md border px-2 text-sm"
                        aria-label={`${item.part.name} quantity`}
                      />
                      <span className="text-sm font-semibold">
                        {money(item.quantity * item.part.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 border-t pt-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{money(total)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-lg font-semibold">
                <span>Estimated Total</span>
                <span>{money(total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Customer Details</h2>
            <div className="mt-4 space-y-3">
              {[
                ["name", "Name"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["siteAddress", "Address / Site location"],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm font-medium text-slate-700">
                  {label}
                  <input
                    value={details[key as keyof typeof details]}
                    onChange={(event) =>
                      setDetails((current) => ({ ...current, [key]: event.target.value }))
                    }
                    className="mt-1 h-10 w-full rounded-md border px-3 text-sm"
                    required
                  />
                </label>
              ))}
              <label className="block text-sm font-medium text-slate-700">
                Notes / site requirements
                <textarea
                  value={details.notes}
                  onChange={(event) =>
                    setDetails((current) => ({ ...current, notes: event.target.value }))
                  }
                  className="mt-1 min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Number of floors, cable routing, preferred installation time..."
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || selectedItems.length === 0}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
