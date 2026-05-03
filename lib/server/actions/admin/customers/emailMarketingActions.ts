"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/db";
import { buildAppUrl } from "@/config/env";
import { requireAdmin } from "@/lib/auth/requireSession";
import { generateSlug } from "@/lib/helpers/slugify";
import { buildMarketingEmailTemplate } from "@/lib/helpers/emailMarketing";
import { buildNewsletterUnsubscribeUrl } from "@/lib/helpers/newsletterSecurity";
import { sendEmail } from "@/lib/helpers/sendEmail";
import { Category, Product } from "@/models";
import EmailCampaign from "@/models/emailCampaignModel";
import NewsletterSubscriber from "@/models/newsletterSubscriberModel";
import User from "@/models/userModel";

const secureUrlField = z
  .string()
  .trim()
  .url("CTA URL must be a valid URL.")
  .refine((value) => /^https?:\/\//i.test(value), "CTA URL must start with http or https.")
  .optional()
  .or(z.literal(""));

const emailCampaignSchema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters.").max(150),
  previewText: z.string().trim().max(180).optional().or(z.literal("")),
  body: z.string().trim().min(10, "Email body must be at least 10 characters.").max(20000),
  targetType: z.enum(["none", "page", "category", "brand", "product"]).optional().default("none"),
  targetValue: z.string().trim().max(200).optional().or(z.literal("")),
  audience: z.enum([
    "all-users",
    "verified-users",
    "newsletter-users",
    "newsletter-users-and-guests",
    "guest-subscribers",
  ]),
  ctaLabel: z.string().trim().max(40).optional().or(z.literal("")),
  ctaUrl: secureUrlField,
  publishToSite: z.boolean().optional().default(true),
});

const singleEmailSchema = emailCampaignSchema.extend({
  userId: z
    .string()
    .trim()
    .refine((value) => Types.ObjectId.isValid(value), "User is required."),
});

const manualSubscriberSchema = z.object({
  email: z.string().trim().email("A valid email address is required."),
  name: z.string().trim().max(80).optional().or(z.literal("")),
});

type Audience = z.infer<typeof emailCampaignSchema>["audience"];
type SubscriberEntityType = "user" | "guest";
type CampaignTargetType = z.infer<typeof emailCampaignSchema>["targetType"];

interface Recipient {
  email: string;
  name?: string | null;
  userId?: string;
  kind: SubscriberEntityType;
}

interface ActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface NewsletterSubscriberAdminItem {
  id: string;
  entityType: SubscriberEntityType;
  email: string;
  name: string;
  subscribed: boolean;
  source: string;
  subscribedAt: Date | null;
  unsubscribedAt: Date | null;
  registeredUser: boolean;
  createdAt: Date | null;
  lastCampaignSubject?: string | null;
  lastCampaignSentAt?: Date | null;
}

interface NewsletterSubscriberSummary {
  total: number;
  subscribed: number;
  unsubscribed: number;
  registeredUsers: number;
  guestSubscribers: number;
}

export interface CampaignTargetOption {
  value: string;
  label: string;
  path: string;
}

export interface CampaignTargetOptions {
  pages: CampaignTargetOption[];
  categories: CampaignTargetOption[];
  brands: CampaignTargetOption[];
  products: CampaignTargetOption[];
}

function normalizeOptional(value?: string) {
  return value?.trim() ? value.trim() : undefined;
}

function buildTextVersion(body: string, ctaLabel?: string, ctaUrl?: string) {
  const cta = ctaLabel && ctaUrl ? `\n\n${ctaLabel}: ${ctaUrl}` : "";
  return `${body}${cta}`;
}

function getSafeErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function createCampaignSlug(subject: string) {
  const baseSlug = generateSlug(subject) || "newsletter-campaign";
  return `${baseSlug}-${Date.now().toString(36)}`;
}

function createCampaignSlugFallback() {
  return `newsletter-campaign-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildCampaignFooterHtml(email: string) {
  const unsubscribeUrl = buildNewsletterUnsubscribeUrl(email);
  return `
    You are receiving this email from Proud IT Solutions.<br/>
    If you no longer want updates, you can
    <a href="${unsubscribeUrl}" style="color:#b91c1c;text-decoration:underline;">unsubscribe here</a>.
  `;
}

function buildListUnsubscribeHeaders(email: string) {
  const unsubscribeUrl = buildNewsletterUnsubscribeUrl(email);

  return {
    "List-Unsubscribe": `<${unsubscribeUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

function toEmailKey(email: string | null | undefined) {
  return email?.trim().toLowerCase() || "";
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function toAbsoluteUrl(path: string) {
  return buildAppUrl(normalizePath(path));
}

function getDefaultCtaLabel(targetType: CampaignTargetType) {
  switch (targetType) {
    case "category":
      return "Shop Category";
    case "brand":
      return "Explore Brand";
    case "product":
      return "View Product";
    case "page":
      return "Open Page";
    default:
      return "Learn More";
  }
}

async function getCampaignTargetOptions(): Promise<CampaignTargetOptions> {
  const [categories, brands, products] = await Promise.all([
    Category.find({})
      .select("categoryName slug")
      .sort({ categoryName: 1 })
      .lean<{ categoryName: string; slug: string }[]>(),
    Product.aggregate<{ name: string }>([
      { $match: { brandName: { $exists: true, $ne: "" }, isActive: true } },
      { $group: { _id: "$brandName" } },
      { $project: { _id: 0, name: "$_id" } },
      { $sort: { name: 1 } },
    ]),
    Product.find({ isActive: true })
      .select("name slug")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<{ name: string; slug: string }[]>(),
  ]);

  return {
    pages: [
      { value: "/", label: "Home Page", path: "/" },
      { value: "/shop", label: "Shop Page", path: "/shop" },
      { value: "/promotions", label: "Promotions Page", path: "/promotions" },
      { value: "/build-my-pc", label: "Build My PC", path: "/build-my-pc" },
      { value: "/contact", label: "Contact Page", path: "/contact" },
    ],
    categories: categories.map((category) => ({
      value: category.slug,
      label: category.categoryName,
      path: `/shop?category=${encodeURIComponent(category.slug)}`,
    })),
    brands: brands.map((brand) => ({
      value: brand.name,
      label: brand.name,
      path: `/shop?brand=${encodeURIComponent(brand.name)}`,
    })),
    products: products.map((product) => ({
      value: product.slug,
      label: product.name,
      path: `/products/${product.slug}`,
    })),
  };
}

function resolveCampaignTarget(input: {
  targetType: CampaignTargetType;
  targetValue?: string;
  targetOptions: CampaignTargetOptions;
}) {
  const normalizedValue = normalizeOptional(input.targetValue);

  if (input.targetType === "none" || !normalizedValue) {
    return {
      targetType: "none" as const,
      targetValue: null,
      targetLabel: null,
      targetPath: null,
      ctaUrl: null,
    };
  }

  const optionsByType: Record<Exclude<CampaignTargetType, "none">, CampaignTargetOption[]> = {
    page: input.targetOptions.pages,
    category: input.targetOptions.categories,
    brand: input.targetOptions.brands,
    product: input.targetOptions.products,
  };

  const matchedOption = optionsByType[input.targetType].find(
    (option) => option.value === normalizedValue
  );

  if (!matchedOption) {
    throw new Error("Selected campaign destination is invalid.");
  }

  return {
    targetType: input.targetType,
    targetValue: matchedOption.value,
    targetLabel: matchedOption.label,
    targetPath: matchedOption.path,
    ctaUrl: toAbsoluteUrl(matchedOption.path),
  };
}

async function createEmailCampaignRecord(
  payload: Record<string, unknown> & { slug?: string | null; subject?: string | null }
) {
  const now = new Date();
  const baseSlug =
    payload.slug?.trim() ||
    (payload.subject ? createCampaignSlug(payload.subject) : createCampaignSlugFallback());

  // Backfill any legacy campaign rows that were saved without a slug.
  const legacyNullSlugCampaigns = await EmailCampaign.find({
    $or: [{ slug: null }, { slug: "" }, { slug: { $exists: false } }],
  })
    .select("_id")
    .lean<{ _id: { toString(): string } }[]>();

  for (const campaign of legacyNullSlugCampaigns) {
    const legacySlug = `newsletter-campaign-legacy-${campaign._id.toString()}`;
    await EmailCampaign.updateOne(
      { _id: campaign._id },
      { $set: { slug: legacySlug, updatedAt: now } }
    );
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const documentToInsert = {
      ...payload,
      slug,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await EmailCampaign.collection.insertOne(documentToInsert);
      return documentToInsert;
    } catch (error) {
      const isDuplicateSlug =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 11000 &&
        "keyPattern" in error &&
        Boolean((error as { keyPattern?: Record<string, unknown> }).keyPattern?.slug);

      if (!isDuplicateSlug || attempt === 2) {
        throw error;
      }
    }
  }
}

function getSubscribedNewsletterUserQuery() {
  return {
    role: { $ne: "admin" },
    $or: [
      { "newsletter.subscribed": true },
      { newsletter: { $exists: false } },
      { "newsletter.subscribed": { $exists: false } },
    ],
  };
}

async function resolveRecipients(audience: Audience): Promise<Recipient[]> {
  const recipients = new Map<string, Recipient>();

  if (audience !== "guest-subscribers") {
    const userQuery =
      audience === "all-users"
        ? { role: { $ne: "admin" } }
        : audience === "verified-users"
          ? { emailVerified: true, role: { $ne: "admin" } }
          : getSubscribedNewsletterUserQuery();

    const users = await User.find(userQuery).select("name email newsletter").lean();

    for (const user of users) {
      if (!user.email) continue;
      recipients.set(user.email.toLowerCase(), {
        email: user.email.toLowerCase(),
        name: user.name,
        userId: String(user._id),
        kind: "user",
      });
    }
  }

  if (audience === "newsletter-users-and-guests" || audience === "guest-subscribers") {
    const subscribers = await NewsletterSubscriber.find({ subscribed: true })
      .select("name email")
      .lean();

    for (const subscriber of subscribers) {
      const email = subscriber.email.toLowerCase();
      if (!recipients.has(email)) {
        recipients.set(email, {
          email,
          name: subscriber.name,
          kind: "guest",
        });
      }
    }
  }

  return [...recipients.values()];
}

async function sendCampaignToRecipients(input: {
  recipients: Recipient[];
  subject: string;
  previewText?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const failures: { email: string; reason: string }[] = [];
  let successCount = 0;
  const userIdsToUpdate: string[] = [];
  const batchSize = 20;

  for (let index = 0; index < input.recipients.length; index += batchSize) {
    const batch = input.recipients.slice(index, index + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (recipient) => {
        const heading = recipient.name
          ? `${recipient.name}, here is an update from Proud IT Solutions`
          : "Latest update from Proud IT Solutions";

        try {
          await sendEmail({
            to: recipient.email,
            subject: input.subject,
            html: buildMarketingEmailTemplate({
              heading,
              previewText: input.previewText,
              body: input.body,
              ctaLabel: input.ctaLabel,
              ctaUrl: input.ctaUrl,
              footerHtml: buildCampaignFooterHtml(recipient.email),
            }),
            text: `${buildTextVersion(input.body, input.ctaLabel, input.ctaUrl)}\n\nUnsubscribe: ${buildNewsletterUnsubscribeUrl(recipient.email)}`,
            headers: buildListUnsubscribeHeaders(recipient.email),
          });

          return { recipient, success: true as const };
        } catch (error) {
          return {
            recipient,
            success: false as const,
            reason: getSafeErrorMessage(error, "Email delivery failed."),
          };
        }
      })
    );

    for (const result of batchResults) {
      if (result.success) {
        successCount += 1;
        if (result.recipient.userId) {
          userIdsToUpdate.push(result.recipient.userId);
        }
      } else {
        failures.push({
          email: result.recipient.email,
          reason: result.reason,
        });
      }
    }
  }

  if (userIdsToUpdate.length > 0) {
    await User.updateMany(
      { _id: { $in: userIdsToUpdate } },
      {
        $set: {
          "newsletter.lastCampaignSentAt": new Date(),
          "newsletter.lastCampaignSubject": input.subject,
        },
      }
    );
  }

  return {
    successCount,
    failureCount: failures.length,
    failures,
  };
}

export async function getEmailMarketingOverview(): Promise<
  ActionResult<{
    totalUsers: number;
    newsletterUsers: number;
    verifiedUsers: number;
    guestSubscribers: number;
    targetOptions: CampaignTargetOptions;
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
      targetType?: CampaignTargetType;
      targetLabel?: string | null;
      targetPath?: string | null;
      createdAt: Date;
    }[];
  }>
> {
  try {
    await connectDB();
    await requireAdmin();

    const [totalUsers, newsletterUsers, verifiedUsers, guestSubscriberDocs, campaigns, targetOptions] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments(getSubscribedNewsletterUserQuery()),
        User.countDocuments({ emailVerified: true, role: { $ne: "admin" } }),
        Promise.all([
          User.find({ role: { $ne: "admin" } }).select("email").lean(),
          NewsletterSubscriber.find({ subscribed: true }).select("email").lean(),
        ]),
        EmailCampaign.find({}).sort({ createdAt: -1 }).limit(8).lean(),
        getCampaignTargetOptions(),
      ]);

    const [userEmails, guestDocs] = guestSubscriberDocs;
    const userEmailSet = new Set(userEmails.map((user) => toEmailKey(user.email)).filter(Boolean));
    const guestSubscribers = guestDocs.filter(
      (guest) => !userEmailSet.has(toEmailKey(guest.email))
    ).length;

    return {
      success: true,
      message: "Email marketing overview loaded.",
      data: {
        totalUsers,
        newsletterUsers,
        verifiedUsers,
        guestSubscribers,
        targetOptions,
        campaigns: campaigns.map((campaign) => ({
          id: String(campaign._id),
          subject: campaign.subject,
          slug: campaign.slug,
          audience: campaign.audience,
          status: campaign.status,
          recipientCount: campaign.recipientCount,
          successCount: campaign.successCount,
          failureCount: campaign.failureCount,
          publishedToSite: campaign.publishedToSite,
          targetType: campaign.targetType ?? "none",
          targetLabel: campaign.targetLabel ?? null,
          targetPath: campaign.targetPath ?? null,
          createdAt: campaign.createdAt,
        })),
      },
    };
  } catch (error) {
    console.error("getEmailMarketingOverview failed:", error);
    return {
      success: false,
      message: getSafeErrorMessage(error, "Unable to load email marketing overview."),
    };
  }
}

export async function getNewsletterSubscribersAdmin(
  filters?: {
    search?: string;
    subscribed?: boolean;
    entityType?: SubscriberEntityType | "all";
  }
): Promise<
  ActionResult<{
    subscribers: NewsletterSubscriberAdminItem[];
    summary: NewsletterSubscriberSummary;
  }>
> {
  try {
    await connectDB();
    await requireAdmin();

    const [users, guests] = await Promise.all([
      User.find({})
        .select("name email newsletter createdAt")
        .sort({ "newsletter.subscribedAt": -1, createdAt: -1 })
        .lean(),
      NewsletterSubscriber.find({})
        .select("name email source subscribed subscribedAt unsubscribedAt createdAt")
        .sort({ subscribedAt: -1, createdAt: -1 })
        .lean(),
    ]);

    const userItems: NewsletterSubscriberAdminItem[] = users.map((user) => ({
      id: String(user._id),
      entityType: "user",
      email: user.email,
      name: user.name || "Registered User",
      subscribed: user.newsletter?.subscribed ?? true,
      source: user.newsletter?.source ?? "register",
      subscribedAt: user.newsletter?.subscribedAt ?? user.createdAt ?? null,
      unsubscribedAt: user.newsletter?.unsubscribedAt ?? null,
      registeredUser: true,
      createdAt: user.createdAt ?? null,
      lastCampaignSubject: user.newsletter?.lastCampaignSubject ?? null,
      lastCampaignSentAt: user.newsletter?.lastCampaignSentAt ?? null,
    }));

    const userEmailSet = new Set(userItems.map((user) => toEmailKey(user.email)).filter(Boolean));

    const guestItems: NewsletterSubscriberAdminItem[] = guests
      .filter((guest) => !userEmailSet.has(toEmailKey(guest.email)))
      .map((guest) => ({
      id: String(guest._id),
      entityType: "guest",
      email: guest.email,
      name: guest.name || "Guest Subscriber",
      subscribed: guest.subscribed,
      source: guest.source,
      subscribedAt: guest.subscribedAt ?? null,
      unsubscribedAt: guest.unsubscribedAt ?? null,
      registeredUser: false,
      createdAt: guest.createdAt ?? null,
      lastCampaignSubject: null,
      lastCampaignSentAt: null,
    }));

    const allSubscribers = [...userItems, ...guestItems];
    let subscribers = [...allSubscribers];

    if (filters?.entityType && filters.entityType !== "all") {
      subscribers = subscribers.filter((item) => item.entityType === filters.entityType);
    }

    if (filters?.subscribed !== undefined) {
      subscribers = subscribers.filter((item) => item.subscribed === filters.subscribed);
    }

    if (filters?.search?.trim()) {
      const query = filters.search.trim().toLowerCase();
      subscribers = subscribers.filter(
        (item) =>
          item.email.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query)
      );
    }

    subscribers.sort((a, b) => {
      const aTime = a.subscribedAt ? new Date(a.subscribedAt).getTime() : 0;
      const bTime = b.subscribedAt ? new Date(b.subscribedAt).getTime() : 0;
      return bTime - aTime;
    });

    const summary: NewsletterSubscriberSummary = {
      total: allSubscribers.length,
      subscribed: allSubscribers.filter((item) => item.subscribed).length,
      unsubscribed: allSubscribers.filter((item) => !item.subscribed).length,
      registeredUsers: allSubscribers.filter((item) => item.entityType === "user").length,
      guestSubscribers: allSubscribers.filter((item) => item.entityType === "guest").length,
    };

    return {
      success: true,
      message: "Subscribers loaded.",
      data: { subscribers, summary },
    };
  } catch (error) {
    console.error("getNewsletterSubscribersAdmin failed:", error);
    return {
      success: false,
      message: getSafeErrorMessage(error, "Unable to load newsletter subscribers."),
    };
  }
}

export async function createGuestNewsletterSubscriberAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    await connectDB();
    await requireAdmin();

    const validated = manualSubscriberSchema.parse({
      email: formData.get("email"),
      name: formData.get("name"),
    });

    const email = validated.email.toLowerCase();

    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      return {
        success: false,
        message: "A registered user with this email already exists. Manage newsletter from that user record.",
      };
    }

    await NewsletterSubscriber.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          name: normalizeOptional(validated.name) ?? null,
          subscribed: true,
          source: "admin",
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath("/admin/newsletter");

    return {
      success: true,
      message: "Subscriber saved successfully.",
    };
  } catch (error) {
    console.error("createGuestNewsletterSubscriberAction failed:", error);
    return {
      success: false,
      message: getSafeErrorMessage(error, "Unable to save subscriber."),
    };
  }
}

export async function updateNewsletterSubscriberStatusAction(input: {
  entityType: SubscriberEntityType;
  id: string;
  subscribed: boolean;
}): Promise<ActionResult> {
  try {
    await connectDB();
    await requireAdmin();

    if (!input.id?.trim()) {
      return { success: false, message: "Subscriber identifier is required." };
    }

    const now = new Date();

    if (input.entityType === "user") {
      const existingUser = await User.findById(input.id).select("newsletter");
      const userEmailDoc = await User.findById(input.id).select("email");

      if (!existingUser || !userEmailDoc?.email) {
        return { success: false, message: "User subscriber not found." };
      }

      const updateResult = await User.updateOne(
        { _id: input.id },
        {
          $set: {
            "newsletter.subscribed": input.subscribed,
            "newsletter.source": existingUser.newsletter?.source ?? "admin",
            "newsletter.subscribedAt": input.subscribed
              ? now
              : existingUser.newsletter?.subscribedAt ?? null,
            "newsletter.unsubscribedAt": input.subscribed ? null : now,
            "newsletter.lastCampaignSentAt": existingUser.newsletter?.lastCampaignSentAt ?? null,
            "newsletter.lastCampaignSubject": existingUser.newsletter?.lastCampaignSubject ?? null,
          },
        }
      );

      if (updateResult.matchedCount === 0) {
        return { success: false, message: "User subscriber not found." };
      }

      await NewsletterSubscriber.deleteMany({ email: toEmailKey(userEmailDoc.email) });
    } else {
      const existingGuest = await NewsletterSubscriber.findById(input.id).select(
        "email source subscribedAt"
      );

      if (!existingGuest) {
        return { success: false, message: "Guest subscriber not found." };
      }

      const existingUserWithEmail = await User.findOne({
        email: toEmailKey((existingGuest as { email?: string | null }).email),
      })
        .select("_id")
        .lean();

      if (existingUserWithEmail) {
        return {
          success: false,
          message: "This email belongs to a registered user. Manage newsletter status from the registered user row.",
        };
      }

      const updateResult = await NewsletterSubscriber.updateOne(
        { _id: input.id },
        {
          $set: {
            subscribed: input.subscribed,
            source: existingGuest.source ?? "footer",
            subscribedAt: input.subscribed ? now : existingGuest.subscribedAt ?? null,
            unsubscribedAt: input.subscribed ? null : now,
          },
        }
      );

      if (updateResult.matchedCount === 0) {
        return { success: false, message: "Guest subscriber not found." };
      }
    }

    revalidatePath("/admin/newsletter");
    revalidatePath("/admin/users");

    return {
      success: true,
      message: input.subscribed ? "Subscriber activated." : "Subscriber unsubscribed.",
    };
  } catch (error) {
    console.error("updateNewsletterSubscriberStatusAction failed:", error);
    return {
      success: false,
      message: getSafeErrorMessage(error, "Unable to update subscriber status."),
    };
  }
}

export async function deleteNewsletterSubscribersAction(input: {
  targets: { entityType: SubscriberEntityType; id: string }[];
}): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    await connectDB();
    await requireAdmin();

    const validTargets = input.targets.filter(
      (target) =>
        (target.entityType === "user" || target.entityType === "guest") &&
        Boolean(target.id?.trim())
    );

    if (validTargets.length === 0) {
      return {
        success: false,
        message: "Select at least one subscriber to delete.",
      };
    }

    const guestIds = validTargets
      .filter((target) => target.entityType === "guest")
      .map((target) => target.id);

    let deletedCount = 0;

    if (guestIds.length > 0) {
      const guestDeleteResult = await NewsletterSubscriber.deleteMany({
        _id: { $in: guestIds },
      });
      deletedCount += guestDeleteResult.deletedCount ?? 0;
    }

    revalidatePath("/admin/newsletter");
    revalidatePath("/admin/users");

    return {
      success: deletedCount > 0,
      message:
        deletedCount > 0
          ? `${deletedCount} subscriber${deletedCount > 1 ? "s" : ""} deleted successfully.`
          : "Only guest subscribers can be deleted from this directory.",
      data: { deletedCount },
    };
  } catch (error) {
    console.error("deleteNewsletterSubscribersAction failed:", error);
    return {
      success: false,
      message: getSafeErrorMessage(error, "Unable to delete subscribers."),
    };
  }
}

export async function deleteEmailCampaignAction(campaignId: string): Promise<ActionResult> {
  try {
    await connectDB();
    await requireAdmin();

    if (!Types.ObjectId.isValid(campaignId)) {
      return {
        success: false,
        message: "Promotion identifier is invalid.",
      };
    }

    const deletedCampaign = await EmailCampaign.findByIdAndDelete(campaignId)
      .select("slug publishedToSite")
      .lean<{ slug?: string | null; publishedToSite?: boolean } | null>();

    if (!deletedCampaign) {
      return {
        success: false,
        message: "Promotion not found or already deleted.",
      };
    }

    revalidatePath("/admin/newsletter");
    revalidatePath("/admin/users");
    revalidatePath("/promotions");

    if (deletedCampaign.slug) {
      revalidatePath(`/promotions/${deletedCampaign.slug}`);
      revalidateTag(`promotion:${deletedCampaign.slug}`, "max");
    }

    revalidateTag("promotions", "max");
    revalidateTag("homepage", "max");

    return {
      success: true,
      message: deletedCampaign.publishedToSite
        ? "Promotion deleted from the website."
        : "Campaign deleted.",
    };
  } catch (error) {
    console.error("deleteEmailCampaignAction failed:", error);
    return {
      success: false,
      message: getSafeErrorMessage(error, "Unable to delete promotion."),
    };
  }
}

export async function sendCustomEmailToUserAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    await connectDB();
    const admin = await requireAdmin();

    const validated = singleEmailSchema.parse({
      userId: formData.get("userId"),
      subject: formData.get("subject"),
      previewText: formData.get("previewText"),
      body: formData.get("body"),
      targetType: formData.get("targetType") || "none",
      targetValue: formData.get("targetValue"),
      audience: "all-users",
      ctaLabel: formData.get("ctaLabel"),
      ctaUrl: formData.get("ctaUrl"),
      publishToSite: false,
    });

    const user = await User.findById(validated.userId).select("name email");
    const userWithRole = await User.findById(validated.userId).select("name email role");

    if (!userWithRole?.email) {
      return {
        success: false,
        message: "Selected user was not found.",
      };
    }

    if (userWithRole.role === "admin") {
      return {
        success: false,
        message: "Custom email cannot be sent to admin accounts.",
      };
    }

    const targetOptions = await getCampaignTargetOptions();
    const target = resolveCampaignTarget({
      targetType: validated.targetType,
      targetValue: validated.targetValue,
      targetOptions,
    });
    const ctaLabel = target.ctaUrl
      ? normalizeOptional(validated.ctaLabel) ?? getDefaultCtaLabel(validated.targetType)
      : normalizeOptional(validated.ctaLabel);

    await sendEmail({
      to: user.email,
      subject: validated.subject,
      html: buildMarketingEmailTemplate({
        heading: `Hello ${userWithRole.name || "there"}`,
        previewText: normalizeOptional(validated.previewText),
        body: validated.body,
        ctaLabel,
        ctaUrl: target.ctaUrl ?? undefined,
        footerHtml: buildCampaignFooterHtml(user.email),
      }),
      text: `${buildTextVersion(
        validated.body,
        ctaLabel,
        target.ctaUrl ?? undefined
      )}\n\nUnsubscribe: ${buildNewsletterUnsubscribeUrl(user.email)}`,
      headers: buildListUnsubscribeHeaders(user.email),
    });

    await createEmailCampaignRecord({
      subject: validated.subject,
      slug: createCampaignSlug(validated.subject),
      previewText: normalizeOptional(validated.previewText) ?? null,
      body: validated.body,
      targetType: target.targetType,
      targetValue: target.targetValue,
      targetLabel: target.targetLabel,
      targetPath: target.targetPath,
      audience: "all-users",
      recipientCount: 1,
      successCount: 1,
      failureCount: 0,
      status: "completed",
      publishedToSite: false,
      publishedAt: null,
      ctaLabel: ctaLabel ?? null,
      ctaUrl: target.ctaUrl ?? null,
      sentBy: {
        userId: admin.id,
        name: admin.name,
        email: admin.email,
      },
      failures: [],
    });

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          "newsletter.lastCampaignSentAt": new Date(),
          "newsletter.lastCampaignSubject": validated.subject,
        },
      }
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin/newsletter");

    return {
      success: true,
      message: `Custom email sent to ${userWithRole.email}.`,
    };
  } catch (error) {
    console.error("sendCustomEmailToUserAction failed:", error);
    return {
      success: false,
      message: getSafeErrorMessage(error, "Failed to send custom email."),
    };
  }
}

export async function sendBulkEmailCampaignAction(
  formData: FormData
): Promise<ActionResult<{ successCount: number; failureCount: number }>> {
  try {
    await connectDB();
    const admin = await requireAdmin();

    const validated = emailCampaignSchema.parse({
      subject: formData.get("subject"),
      previewText: formData.get("previewText"),
      body: formData.get("body"),
      targetType: formData.get("targetType") || "none",
      targetValue: formData.get("targetValue"),
      audience: formData.get("audience"),
      ctaLabel: formData.get("ctaLabel") || "",
      ctaUrl: formData.get("ctaUrl") || "",
      publishToSite: formData.get("publishToSite") !== "false",
    });

    const targetOptions = await getCampaignTargetOptions();
    const target = resolveCampaignTarget({
      targetType: validated.targetType,
      targetValue: validated.targetValue,
      targetOptions,
    });
    const ctaLabel = target.ctaUrl
      ? normalizeOptional(validated.ctaLabel) ?? getDefaultCtaLabel(validated.targetType)
      : normalizeOptional(validated.ctaLabel);

    const recipients = await resolveRecipients(validated.audience);

    if (recipients.length === 0) {
      return {
        success: false,
        message: "No recipients matched the selected audience.",
      };
    }

    const result = await sendCampaignToRecipients({
      recipients,
      subject: validated.subject,
      previewText: normalizeOptional(validated.previewText),
      body: validated.body,
      ctaLabel,
      ctaUrl: target.ctaUrl ?? undefined,
    });

    const status =
      result.successCount === 0
        ? "failed"
        : result.failureCount === 0
          ? "completed"
          : "partial";

    await createEmailCampaignRecord({
      subject: validated.subject,
      slug: createCampaignSlug(validated.subject),
      previewText: normalizeOptional(validated.previewText) ?? null,
      body: validated.body,
      targetType: target.targetType,
      targetValue: target.targetValue,
      targetLabel: target.targetLabel,
      targetPath: target.targetPath,
      audience: validated.audience,
      recipientCount: recipients.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
      status,
      publishedToSite: validated.publishToSite,
      publishedAt: validated.publishToSite ? new Date() : null,
      ctaLabel: ctaLabel ?? null,
      ctaUrl: target.ctaUrl ?? null,
      sentBy: {
        userId: admin.id,
        name: admin.name,
        email: admin.email,
      },
      failures: result.failures.slice(0, 25),
    });

    revalidatePath("/admin/newsletter");
    revalidatePath("/admin/users");
    revalidatePath("/promotions");
    revalidateTag("promotions", "max");
    revalidateTag("homepage", "max");

    return {
      success: result.successCount > 0,
      message:
        result.failureCount === 0
          ? `Campaign sent to ${result.successCount} recipients.`
          : `Campaign finished with ${result.successCount} successful deliveries and ${result.failureCount} failures.`,
      data: {
        successCount: result.successCount,
        failureCount: result.failureCount,
      },
    };
  } catch (error) {
    console.error("sendBulkEmailCampaignAction failed:", error);
    return {
      success: false,
      message: getSafeErrorMessage(error, "Failed to send email campaign."),
    };
  }
}

export async function updateUserNewsletterStatusAction(
  userId: string,
  subscribed: boolean
): Promise<ActionResult> {
  return updateNewsletterSubscriberStatusAction({
    entityType: "user",
    id: userId,
    subscribed,
  });
}
