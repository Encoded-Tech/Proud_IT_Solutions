import { APP_NAME, APP_URL } from "@/config/env";

function sanitizeUrl(value?: string) {
  if (!value?.trim()) return APP_URL || "#";

  try {
    const candidate = new URL(value, APP_URL);
    if (candidate.protocol === "http:" || candidate.protocol === "https:") {
      return candidate.toString();
    }
  } catch {
    return APP_URL || "#";
  }

  return APP_URL || "#";
}

function sanitizeOptionalUrl(value?: string) {
  if (!value?.trim()) return "";

  try {
    const candidate = new URL(value, APP_URL);
    if (candidate.protocol === "http:" || candidate.protocol === "https:") {
      return candidate.toString();
    }
  } catch {
    return "";
  }

  return "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function textToHtmlParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px;">${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function buildMarketingEmailTemplate(input: {
  heading: string;
  previewText?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  footerNote?: string;
  footerHtml?: string;
}) {
  const appName = APP_NAME || "Proud IT Solutions";
  const previewText = input.previewText ? escapeHtml(input.previewText) : "";
  const footerNote = escapeHtml(
    input.footerNote || `You are receiving this email from ${appName}.`
  );
  const safeHeading = escapeHtml(input.heading);
  const safeCtaLabel = input.ctaLabel ? escapeHtml(input.ctaLabel) : "";
  const safeCtaUrl = sanitizeUrl(input.ctaUrl);
  const safeImageUrl = sanitizeOptionalUrl(input.imageUrl);
  const safeImageAlt = escapeHtml(input.imageAlt || input.heading);
  const bodyHtml = textToHtmlParagraphs(input.body);

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${previewText}
    </div>
    <div style="margin:0;background:#f4f4f5;padding:32px 12px;font-family:Arial,sans-serif;color:#18181b;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:20px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#b91c1c,#7f1d1d);padding:28px 32px;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.8;margin-bottom:8px;">${escapeHtml(
            appName
          )}</div>
          <h1 style="margin:0;font-size:28px;line-height:1.2;">${safeHeading}</h1>
          ${
            previewText
              ? `<p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#fee2e2;">${previewText}</p>`
              : ""
          }
        </div>
        <div style="padding:32px;">
          ${
            safeImageUrl
              ? `<div style="margin:0 0 24px;">
                  <img
                    src="${safeImageUrl}"
                    alt="${safeImageAlt}"
                    style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:16px;object-fit:cover;"
                  />
                </div>`
              : ""
          }
          <div style="font-size:15px;line-height:1.75;color:#3f3f46;">
            ${bodyHtml}
          </div>
          ${
            input.ctaLabel && input.ctaUrl
              ? `<div style="margin-top:24px;">
                  <a href="${safeCtaUrl}" style="display:inline-block;background:#b91c1c;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">
                    ${safeCtaLabel}
                  </a>
                </div>`
              : ""
          }
        </div>
        <div style="border-top:1px solid #e4e4e7;padding:20px 32px;background:#fafafa;font-size:12px;line-height:1.6;color:#71717a;">
          ${input.footerHtml || footerNote}
        </div>
      </div>
    </div>
  `;
}
