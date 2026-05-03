"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Link2, QrCode, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ProductShareButtonProps = {
  productName: string;
};

type ShareMode = "link" | "qr";

export default function ProductShareButton({ productName }: ProductShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [mode, setMode] = useState<ShareMode>("link");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  const syncCurrentUrl = () => {
    if (typeof window === "undefined") return "";

    const currentUrl = window.location.href;
    setShareUrl(currentUrl);
    return currentUrl;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      syncCurrentUrl();
      setCopied(false);
    }
  };

  const copyLink = async () => {
    const url = shareUrl || syncCurrentUrl();
    if (!url) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      toast.success("Product link copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Unable to copy product link");
    }
  };

  const nativeShare = async () => {
    const url = shareUrl || syncCurrentUrl();
    if (!url || typeof navigator === "undefined" || !navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: productName,
        text: "Check this product",
        url,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copyLink();
    }
  };

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${productName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "product"}-qr.png`;
    link.click();
  };

  const optionClass = (option: ShareMode) =>
    cn(
      "flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition",
      mode === option
        ? "border-primarymain bg-red-50 text-primarymain shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50/60"
    );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          onClick={syncCurrentUrl}
          className="group inline-flex h-12 items-center gap-2 rounded-full border border-red-100 bg-white px-4 text-sm font-semibold text-primarymain shadow-sm transition hover:-translate-y-0.5 hover:border-primarymain/40 hover:bg-red-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primarymain/30"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share Product with Friends</span>
          <span className="sm:hidden">Share</span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92vh] w-full max-w-lg rounded-t-3xl border-red-100 bg-white p-0 shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:w-[min(92vw,32rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border"
      >
        <SheetHeader className="border-b border-slate-100 px-5 pb-4 pt-5">
          <SheetTitle className="flex items-center gap-2 text-lg text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-primarymain">
              <Share2 className="h-4 w-4" />
            </span>
            Share Product
          </SheetTitle>
          <SheetDescription className="text-slate-500">
            Send this product page to a friend or share it through a QR code.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <div className="flex gap-2 rounded-xl bg-slate-50 p-1.5">
            <button type="button" onClick={() => setMode("link")} className={optionClass("link")}>
              <Link2 className="h-4 w-4" />
              Share Direct Link
            </button>
            <button type="button" onClick={() => setMode("qr")} className={optionClass("qr")}>
              <QrCode className="h-4 w-4" />
              Share Through QR
            </button>
          </div>

          {mode === "link" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product link
                </label>
                <Input
                  readOnly
                  value={shareUrl}
                  onFocus={(event) => event.currentTarget.select()}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 text-sm"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {canNativeShare && (
                  <Button
                    type="button"
                    onClick={nativeShare}
                    className="h-11 rounded-xl bg-primarymain text-white hover:bg-red-700"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Now
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={copyLink}
                  variant={canNativeShare ? "outline" : "default"}
                  className={cn(
                    "h-11 rounded-xl",
                    canNativeShare
                      ? "border-red-100 text-primarymain hover:bg-red-50"
                      : "bg-primarymain text-white hover:bg-red-700"
                  )}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy Link
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-red-50/70 to-white p-5 shadow-sm">
                <div
                  ref={qrRef}
                  className="mx-auto flex w-fit rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <QRCodeCanvas value={shareUrl} size={220} includeMargin />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={downloadQr}
                  className="h-11 rounded-xl bg-primarymain text-white hover:bg-red-700"
                >
                  <Download className="h-4 w-4" />
                  Download QR
                </Button>
                <Button
                  type="button"
                  onClick={copyLink}
                  variant="outline"
                  className="h-11 rounded-xl border-red-100 text-primarymain hover:bg-red-50"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy Link
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
