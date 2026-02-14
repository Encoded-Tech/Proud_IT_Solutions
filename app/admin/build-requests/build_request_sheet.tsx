"use client";

import { useState, useTransition, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { IBuildRequestMapped } from "@/lib/server/mappers/MapBuildUserPc";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  adminApproveBuild,
  adminRejectBuild,
  adminUpdateBuildNotes,
  adminUpdateBuildStatus,
  adminUpdateCompatibility,
} from "@/lib/server/actions/admin/BuildMyPc/buildMyPcAction";
import {
  CheckCircle2,
  XCircle,
  Save,
  User,
  Mail,
  Package,
  IndianRupee,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface BuildRequestSheetProps {
  build: IBuildRequestMapped;
  onClose: () => void;
}

type ServerBuildStatus =
  | "submitted"
  | "reviewed"
  | "approved"
  | "rejected"
  | "checked_out";

type BuildStatus = 
  | "draft"
  | "submitted" 
  | "reviewed" 
  | "approved" 
  | "rejected" 
  | "checked_out";

type CompatibilityStatus = "pending" | "passed" | "failed";

const STATUS_CONFIG: Record<
  BuildStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Draft",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    icon: <FileText className="w-4 h-4" />,
  },
  submitted: {
    label: "Submitted",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: <Package className="w-4 h-4" />,
  },
  reviewed: {
    label: "Reviewed",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: <Clock className="w-4 h-4" />,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: <XCircle className="w-4 h-4" />,
  },
  checked_out: {
    label: "Checked Out",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
};

const COMPATIBILITY_CONFIG: Record<
  CompatibilityStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-300",
    icon: <Clock className="w-4 h-4" />,
  },
  passed: {
    label: "Passed",
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  failed: {
    label: "Failed",
    color: "bg-rose-100 text-rose-700 border-rose-300",
    icon: <ShieldAlert className="w-4 h-4" />,
  },
};

export default function BuildRequestSheet({ build, onClose }: BuildRequestSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [notes, setNotes] = useState<string>(build.adminNotes || "");
  const [selectedStatus, setSelectedStatus] = useState<BuildStatus>(build.status as BuildStatus);
  const [selectedCompatibility, setSelectedCompatibility] = useState<CompatibilityStatus>(
    build.compatibilityStatus as CompatibilityStatus
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async (): Promise<void> => {
    setActionLoading("notes");
    try {
      await adminUpdateBuildNotes(build.id, notes);
      toast.success("Admin notes saved successfully");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to save notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (): Promise<void> => {
    setActionLoading("approve");
    try {
      await adminApproveBuild(build.id);
      toast.success("Build request approved");
      startTransition(() => {
        router.refresh();
        onClose();
      });
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Failed to approve build request");
      setActionLoading(null);
    }
  };

  const handleReject = async (): Promise<void> => {
    setActionLoading("reject");
    try {
      await adminRejectBuild(build.id, notes);
      toast.success("Build request rejected");
      startTransition(() => {
        router.refresh();
        onClose();
      });
    } catch (error) {
      console.error("Failed to reject:", error);
      toast.error("Failed to reject build request");
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (newStatus: string): Promise<void> => {
    if (newStatus === "draft") {
      toast.error("Cannot change status back to draft");
      return;
    }

    setActionLoading("status");
    setSelectedStatus(newStatus as BuildStatus);
    
    try {
      await adminUpdateBuildStatus(build.id, newStatus as ServerBuildStatus);
      toast.success(`Status updated to ${newStatus}`);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
      setSelectedStatus(build.status as BuildStatus);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompatibilityChange = async (newCompatibility: CompatibilityStatus): Promise<void> => {
    if (newCompatibility === "pending") return;
    
    setActionLoading("compatibility");
    setSelectedCompatibility(newCompatibility);
    try {
      await adminUpdateCompatibility(build.id, newCompatibility as "passed" | "failed");
      toast.success(`Compatibility marked as ${newCompatibility}`);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to update compatibility:", error);
      toast.error("Failed to update compatibility");
      setSelectedCompatibility(build.compatibilityStatus as CompatibilityStatus);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full  sm:max-w-3xl overflow-y-auto p-0">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <SheetHeader className="px-6  bg-gradient-to-br from-red-600 via-red-700 to-rose-800 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-2xl font-bold text-slate-900 mb-1">
                  Build Request Details
                </SheetTitle>
                <SheetDescription className="text-white">
                  Review and manage this build request
                </SheetDescription>
              </div>
              <SheetClose className="rounded-lg p-2  bg-slate-100 transition-colors">
                <X className="h-5 w-5 hover:text-red-600 text-slate-500" />
              </SheetClose>
            </div>
          </SheetHeader>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Request Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Request ID
              </p>
              <p className="text-lg font-mono font-bold text-slate-900">
                #{build.id.slice(-12).toUpperCase()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                Created Date
              </p>
              <div className="flex items-center text-sm font-semibold text-blue-900">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(build.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-slate-900">Customer Information</h3>
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-500/30">
                  {build.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-900">
                    {build.user.name || "Unknown User"}
                  </p>
                  {build.user.email && (
                    <div className="flex items-center text-sm text-slate-600 mt-1">
                      <Mail className="w-4 h-4 mr-2" />
                      {build.user.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-slate-900">Status Management</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                  Build Status
                </label>
                <Select 
                  value={selectedStatus} 
                  onValueChange={handleStatusChange}
                  disabled={actionLoading === "status"}
                >
                  <SelectTrigger className="h-11 border-slate-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                        disabled={key === "draft"}
                      >
                        <div className="flex items-center gap-2">
                          {config.icon}
                          {config.label}
                          {key === "draft" && <span className="text-xs text-slate-400">(read-only)</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                  Compatibility
                </label>
                <Select 
                  value={selectedCompatibility} 
                  onValueChange={(value) => handleCompatibilityChange(value as CompatibilityStatus)}
                  disabled={actionLoading === "compatibility"}
                >
                  <SelectTrigger className="h-11 border-slate-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COMPATIBILITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key} disabled={key === "pending"}>
                        <div className="flex items-center gap-2">
                          {config.icon}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn(
                  "px-4 py-2 border font-semibold text-sm shadow-sm",
                  STATUS_CONFIG[build.status as BuildStatus].color
                )}
              >
                <span className="mr-2">{STATUS_CONFIG[build.status as BuildStatus].icon}</span>
                {STATUS_CONFIG[build.status as BuildStatus].label}
              </Badge>
              <Badge
                className={cn(
                  "px-4 py-2 border font-semibold text-sm shadow-sm",
                  COMPATIBILITY_CONFIG[build.compatibilityStatus as CompatibilityStatus].color
                )}
              >
                <span className="mr-2">
                  {COMPATIBILITY_CONFIG[build.compatibilityStatus as CompatibilityStatus].icon}
                </span>
                {COMPATIBILITY_CONFIG[build.compatibilityStatus as CompatibilityStatus].label}
              </Badge>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Parts List */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Build Components
                <span className="ml-2 text-sm font-normal text-slate-500">({build.parts.length} items)</span>
              </h3>
            </div>
            <div className="space-y-3">
              {build.parts.map((part) => (
                <div
                  key={part.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-red-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {part.imageUrl ? (
                      <Image
                        width={500}
                        height={500}
                        src={part.imageUrl}
                        alt={part.name}
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-300 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 mb-2 text-base">{part.name}</p>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs font-medium">
                              {part.type}
                            </Badge>
                            <span className="text-sm text-slate-600">Qty: <span className="font-semibold">{part.quantity}</span></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-xl font-bold text-slate-900 mb-1">
                            <IndianRupee className="w-5 h-5" />
                            {(part.price * part.quantity).toLocaleString("en-IN")}
                          </div>
                          <p className="text-xs text-slate-500">
                            ₹{part.price.toLocaleString("en-IN")} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Price Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-slate-900">Price Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Subtotal</span>
                <span className="text-lg font-bold text-slate-900">
                  ₹{build.subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-900 font-bold text-lg">Grand Total</span>
                <span className="text-2xl font-bold text-red-600">
                  ₹{build.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Admin Notes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-slate-900">Admin Notes</h3>
            </div>
            <Textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add internal notes about this build request..."
              className="min-h-[140px] border-slate-300 focus:border-red-500 focus:ring-red-500 resize-none text-sm"
            />
            <Button
              onClick={handleSaveNotes}
              disabled={actionLoading === "notes" || notes === build.adminNotes}
              className="mt-3 bg-slate-700 hover:bg-slate-800 text-white shadow-lg"
            >
              {actionLoading === "notes" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">Quick Actions</p>
              <p className="text-xs text-amber-700">
                Approve or reject this build request. Rejection will include any admin notes you&apos;ve added.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              disabled={actionLoading !== null || isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {actionLoading === "approve" ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Approve Build
                </>
              )}
            </Button>

            <Button
              onClick={handleReject}
              disabled={actionLoading !== null || isPending}
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700 h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {actionLoading === "reject" ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2" />
                  Reject Build
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}