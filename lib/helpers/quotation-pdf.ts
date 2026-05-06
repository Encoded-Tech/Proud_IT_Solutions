"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QuotationDraft } from "@/types/quotation";

const UNSUPPORTED_COLOR_RE = /(lab|oklch|lch|color-mix)\(/i;
const COLOR_SCAN_PROPERTIES = [
  "color",
  "backgroundColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
  "boxShadow",
] as const;

type QuotationAssetData = {
  stampDataUrl: string;
  signatureDataUrl: string;
};

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function toAbsoluteUrl(src: string) {
  try {
    return new URL(src, window.location.origin).toString();
  } catch {
    return src;
  }
}

function isRemoteUrl(src: string) {
  try {
    return new URL(src, window.location.origin).origin !== window.location.origin;
  } catch {
    return false;
  }
}

async function imageToDataUrl(src: string): Promise<string> {
  if (!src) return "";
  if (src.startsWith("data:")) return src;

  const response = await fetch(src, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load image: ${src}`);
  }

  const blob = await response.blob();
  return await blobToDataUrl(blob);
}

async function loadQuotationAssetData(draft: QuotationDraft): Promise<QuotationAssetData> {
  const stampSrc = draft.assets.stamp || "";
  const signatureSrc = draft.assets.signature || "/assets/quotation/signature.png";

  const [stampDataUrl, signatureDataUrl] = await Promise.all([
    stampSrc ? imageToDataUrl(stampSrc) : Promise.resolve(""),
    signatureSrc ? imageToDataUrl(signatureSrc) : Promise.resolve(""),
  ]);

  return {
    stampDataUrl,
    signatureDataUrl,
  };
}

function normalizeAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("data:")) return url;

  try {
    const parsed = new URL(url, window.location.origin);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function isAllowedLocalQuotationAsset(url: string) {
  if (url.startsWith("data:")) return true;

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin && parsed.pathname.startsWith("/assets/quotation/");
  } catch {
    return false;
  }
}

function isUnsafeExportUrl(url: string) {
  if (!url) return false;
  const normalized = normalizeAssetUrl(url);

  if (normalized.startsWith("data:")) return false;
  if (normalized.startsWith("blob:")) return true;
  if (normalized.includes("/_next/image")) return true;
  if (isRemoteUrl(normalized)) return true;

  return !isAllowedLocalQuotationAsset(normalized);
}

function logQuotationAssetDiagnostics(quotationElement: HTMLElement) {
  const entries: Array<{
    type: "img" | "background";
    target: string;
    url: string;
    status: "safe" | "unsafe";
  }> = [];

  const images = Array.from(quotationElement.querySelectorAll("img"));
  for (const img of images) {
    const url = img.currentSrc || img.getAttribute("src") || "";
    entries.push({
      type: "img",
      target: img.getAttribute("alt") || img.tagName.toLowerCase(),
      url,
      status: isUnsafeExportUrl(url) ? "unsafe" : "safe",
    });
  }

  const nodes = [quotationElement, ...Array.from(quotationElement.querySelectorAll<HTMLElement>("*"))];
  for (const node of nodes) {
    const backgroundImage = window.getComputedStyle(node).backgroundImage;
    const matches = Array.from(backgroundImage.matchAll(/url\((['"]?)(.*?)\1\)/gi));

    for (const match of matches) {
      const url = (match[2] || "").trim();
      if (!url) continue;

      entries.push({
        type: "background",
        target: node.getAttribute("data-letterpad-layer") !== null ? "letterpad" : node.tagName.toLowerCase(),
        url,
        status: isUnsafeExportUrl(url) ? "unsafe" : "safe",
      });
    }
  }

  if (entries.length > 0) {
    console.table(entries);
  }

  const unsafeEntries = entries.filter((entry) => entry.status === "unsafe");
  if (unsafeEntries.length > 0) {
    console.error("Quotation export found non-sanitized asset URLs in .quotation-page.", unsafeEntries);
  }
}

function normalizeCssColor(value: string) {
  const probe = document.createElement("span");
  probe.style.position = "fixed";
  probe.style.left = "-10000px";
  probe.style.top = "0";
  probe.style.color = "#000";
  document.body.appendChild(probe);

  try {
    probe.style.color = value;
    return window.getComputedStyle(probe).color || value;
  } catch {
    return value;
  } finally {
    probe.remove();
  }
}

function replaceUnsupportedColorFunctions(value: string) {
  return value.replace(/(oklch|lab|lch|color-mix)\([^)]+\)/gi, (match) =>
    normalizeCssColor(match)
  );
}

function findUnsupportedColors(root: HTMLElement) {
  const bad: Array<{
    tag: string;
    className: string;
    property: string;
    value: string;
    text: string;
  }> = [];

  const elements = [root, ...Array.from(root.querySelectorAll("*"))] as HTMLElement[];

  for (const el of elements) {
    const styles = window.getComputedStyle(el);

    for (const prop of COLOR_SCAN_PROPERTIES) {
      const value = styles.getPropertyValue(prop);

      if (value && UNSUPPORTED_COLOR_RE.test(value)) {
        bad.push({
          tag: el.tagName.toLowerCase(),
          className: String(el.className || ""),
          property: prop,
          value,
          text: (el.textContent || "").slice(0, 60),
        });
      }
    }
  }

  return bad;
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
}

function getQuotationExportPages(quotationElement: HTMLElement) {
  const pageElements = Array.from(
    quotationElement.querySelectorAll<HTMLElement>("[data-quotation-export-page='true']")
  );

  if (pageElements.length > 0) {
    return pageElements;
  }

  if (
    quotationElement.matches("[data-quotation-export-page='true']") ||
    quotationElement.matches(".quotation-page")
  ) {
    return [quotationElement];
  }

  const page = quotationElement.querySelector<HTMLElement>(".quotation-page");
  if (!page) {
    throw new Error("Quotation preview is not ready for export.");
  }

  return [page];
}

export async function downloadQuotationPdf(
  quotationElement: HTMLElement,
  draft: QuotationDraft,
  filename: string
): Promise<void> {
  const exportPages = getQuotationExportPages(quotationElement);

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  for (const page of exportPages) {
    await waitForImages(page);
    logQuotationAssetDiagnostics(page);

    const badColors = findUnsupportedColors(page);
    if (badColors.length > 0) {
      console.table(badColors);
      throw new Error(
        "Quotation PDF export still contains lab/oklch/lch/color-mix colors. Replace these Tailwind/theme colors with hex/rgb/rgba before html2canvas."
      );
    }
  }

  const { stampDataUrl, signatureDataUrl } = await loadQuotationAssetData(draft);

  if (draft.assets.stamp && !stampDataUrl) {
    throw new Error("Failed to load the quotation stamp for PDF export.");
  }

  if (draft.assets.signature && !signatureDataUrl) {
    throw new Error("Failed to load the quotation signature for PDF export.");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: false,
  });

  for (let index = 0; index < exportPages.length; index += 1) {
    const page = exportPages[index];
    await waitForImages(page);

    const canvas = await html2canvas(page, {
      scale: Math.max(4, window.devicePixelRatio || 1),
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      foreignObjectRendering: false,
      onclone: (clonedDocument) => {
        clonedDocument.documentElement.style.backgroundColor = "#ffffff";
        clonedDocument.body.style.backgroundColor = "#ffffff";
        clonedDocument.body.style.color = "#0f172a";

        const clonedPages = Array.from(
          clonedDocument.querySelectorAll<HTMLElement>("[data-quotation-export-page='true']")
        );
        const roots = clonedPages.length
          ? clonedPages
          : Array.from(clonedDocument.querySelectorAll<HTMLElement>(".quotation-page"));

        for (const clonedRoot of roots) {
          clonedRoot.style.width = "210mm";
          clonedRoot.style.height = "297mm";
          clonedRoot.style.minHeight = "297mm";
          clonedRoot.style.maxHeight = "297mm";
          clonedRoot.style.overflow = "hidden";
          clonedRoot.style.backgroundColor = "#ffffff";
          clonedRoot.style.color = "#0f172a";
          clonedRoot.style.boxShadow = "none";
          clonedRoot.style.setProperty("-webkit-print-color-adjust", "exact");
          clonedRoot.style.printColorAdjust = "exact";

          const clonedImages = Array.from(clonedRoot.querySelectorAll("img"));
          for (const img of clonedImages) {
            img.removeAttribute("srcset");
            img.removeAttribute("sizes");
            img.crossOrigin = "anonymous";
          }

          const stamps = Array.from(clonedRoot.querySelectorAll<HTMLImageElement>("[data-stamp-image]"));
          for (const stamp of stamps) {
            if (stampDataUrl) {
              stamp.src = stampDataUrl;
            }
          }

          const signatures = Array.from(
            clonedRoot.querySelectorAll<HTMLImageElement>("[data-signature-image]")
          );
          for (const signature of signatures) {
            if (signatureDataUrl) {
              signature.src = signatureDataUrl;
              if (!stampDataUrl) {
                signature.style.display = "block";
                signature.style.width = "25mm";
                signature.style.height = "auto";
                signature.style.maxWidth = "none";
                signature.style.maxHeight = "none";
                signature.style.objectFit = "contain";
                signature.style.objectPosition = "center";
                signature.style.margin = "0 auto 0.4mm";
                signature.style.transform = "none";
                signature.style.position = "static";
              }
            }
          }

          const all = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll("*"))] as HTMLElement[];
          for (const el of all) {
            if (el.closest("[data-letterhead-chrome]")) {
              for (const prop of COLOR_SCAN_PROPERTIES) {
                const inlineValue = el.style.getPropertyValue(prop);
                if (inlineValue && UNSUPPORTED_COLOR_RE.test(inlineValue)) {
                  el.style.setProperty(prop, replaceUnsupportedColorFunctions(inlineValue));
                }
              }
              continue;
            }

            el.style.color = el.style.color || "#0f172a";
            el.style.borderColor = "#cbd5e1";
            el.style.outlineColor = "#cbd5e1";
            el.style.textDecorationColor = "#0f172a";

            for (const prop of COLOR_SCAN_PROPERTIES) {
              const inlineValue = el.style.getPropertyValue(prop);
              if (inlineValue && UNSUPPORTED_COLOR_RE.test(inlineValue)) {
                el.style.setProperty(prop, replaceUnsupportedColorFunctions(inlineValue));
              }
            }

            const tag = el.tagName.toLowerCase();

            if (tag === "th") {
              el.style.backgroundColor = "#dc2626";
              el.style.color = "#ffffff";
              el.style.borderColor = "#ef4444";
            }

            if (tag === "td") {
              el.style.color = "#0f172a";
              el.style.borderColor = "#cbd5e1";
            }

            if (el.classList.contains("total-row")) {
              el.style.backgroundColor = "#f8fafc";
              el.style.color = "#0f172a";
            }

            if (el.classList.contains("quotation-items-table")) {
              el.style.backgroundColor = "#ffffff";
              el.style.color = "#0f172a";
              el.style.borderColor = "#cbd5e1";
            }

            if (el.classList.contains("q-text-white")) {
              el.style.color = "#ffffff";
            }

            if (el.classList.contains("q-text-900")) {
              el.style.color = "#0f172a";
            }

            if (el.classList.contains("q-text-800")) {
              el.style.color = "#1e293b";
            }

            if (el.classList.contains("q-text-700")) {
              el.style.color = "#334155";
            }

            if (el.classList.contains("q-text-600")) {
              el.style.color = "#475569";
            }
          }
        }
      },
    });

    const imageData = canvas.toDataURL("image/png");

    if (index > 0) {
      pdf.addPage("a4", "portrait");
    }

    pdf.addImage(imageData, "PNG", 0, 0, 210, 297, undefined, "NONE");
  }

  pdf.save(filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`);
}
