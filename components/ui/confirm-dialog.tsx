"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  pending?: boolean;
  tone?: "default" | "danger";
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  pending = false,
  tone = "default",
}: ConfirmDialogProps) {
  const isDanger = tone === "danger";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl outline-none sm:w-[calc(100%-2rem)] sm:p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isDanger ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-700"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <Dialog.Title className="text-lg font-black tracking-tight text-slate-900">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="w-full rounded-xl border-slate-200 sm:w-auto"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={() => void onConfirm()}
              disabled={pending}
              className={`w-full rounded-xl sm:w-auto ${
                isDanger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"
              }`}
            >
              {pending ? "Processing..." : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
