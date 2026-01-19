

"use client";

import { IBuildPartMapped, IBuildRequestMapped } from "@/lib/server/mappers/MapBuildMyPc";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
    build: IBuildRequestMapped;
}

export default function BuildRequestView({ build }: Props) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-10"
        >
            {/* Header */}
            <Header build={build} />

            {/* Main Layout */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Parts */}
                <div className="lg:col-span-2">
                    <PartsGrid parts={build.parts} />
                </div>

                {/* Summary */}
                <div className="space-y-6">
                    <CompatibilityCard build={build} />
                    <Totals subtotal={build.subtotal} grandTotal={build.grandTotal} />
                    {build.status === "approved" && (
                        <button
                            onClick={() => router.push(`/checkout?source=build&buildId=${build.id}`)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/80"
                        >
                            <ShoppingCart size={18} />
                            Proceed to Checkout
                        </button>
                    )}

                    {build.status !== "approved" && (
                        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                            <span className="mt-0.5 text-amber-600">⏳</span>
                            <p className="text-sm text-amber-800">
                                <span className="font-medium">Awaiting admin approval.</span>{" "}
                                Your build will be available for checkout once it’s reviewed.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {build.adminNotes && <AdminNotes notes={build.adminNotes} />}
        </motion.div>
    );
}


function Header({ build }: { build: IBuildRequestMapped }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">
                    {build.user.name}&#39;s PC Build
                </h1>
                <p className="text-sm text-zinc-500">
                    Build ID · {build.id}
                </p>
            </div>

            <span className={`rounded-full px-4 py-1 text-sm font-medium ${statusColor(build.status)}`}>
                {build.status.replace("_", " ").toUpperCase()}
            </span>
        </div>
    );
}

const statusColor = (status: IBuildRequestMapped["status"]) => {
    switch (status) {
        case "approved":
            return "bg-emerald-100 text-emerald-700";
        case "rejected":
            return "bg-red-100 text-red-700";
        case "reviewed":
            return "bg-blue-100 text-blue-700";
        default:
            return "bg-green-100 text-green-700";
    }
};


function PartsGrid({ parts }: { parts: IBuildPartMapped[] }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {parts.map((part) => (
                <div
                    key={part.id}
                    className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                        <Image
                            src={part.imageUrl ?? "placeholder.png"} // fallback-friendly
                            alt={part.name}
                            fill
                            className="object-contain p-2"
                        />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                        <div>
                            <p className="text-xs uppercase text-zinc-500">{part.type}</p>
                            <p className="font-semibold text-zinc-900">{part.name}</p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500">Qty: {part.quantity}</span>
                            <span className="font-medium">
                                NPR {part.price.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}


function Totals({ subtotal, grandTotal }: { subtotal: number; grandTotal: number }) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900">
                Order Summary
            </h3>

            <div className="space-y-2 text-sm">
                <Row label="Subtotal" value={`NPR ${subtotal.toLocaleString()}`} />
                <Row label="Grand Total" value={`NPR ${grandTotal.toLocaleString()}`} strong />
            </div>
        </div>
    );
}


function CompatibilityCard({ build }: { build: IBuildRequestMapped }) {
    const icon =
        build.compatibilityStatus === "passed" ? (
            <CheckCircle className="text-emerald-600" />
        ) : build.compatibilityStatus === "failed" ? (
            <XCircle className="text-red-600" />
        ) : (
            <Clock className="text-zinc-500" />
        );

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-zinc-900">
                Compatibility
            </h3>

            <div className="flex items-center gap-2">
                {icon}
                <span className="font-medium capitalize">
                    {build.compatibilityStatus}
                </span>
            </div>
        </div>
    );
}

function AdminNotes({ notes }: { notes: string }) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                Notes from Expert
            </h3>
            <p className="text-sm leading-relaxed text-zinc-700">
                {notes}
            </p>
        </div>
    );
}


function Row({
    label,
    value,
    strong,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-zinc-500">{label}</span>
            <span className={strong ? "font-semibold text-zinc-900" : "font-medium"}>
                {value}
            </span>
        </div>
    );
}

