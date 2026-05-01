"use server";

import { cacheLife, cacheTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/db";
import { verifyNewsletterUnsubscribeToken } from "@/lib/helpers/newsletterSecurity";
import { sanitize } from "@/lib/helpers/performValidation";
import { applyRateLimit, buildRateLimitKey } from "@/lib/security/rate-limit";
import EmailCampaign from "@/models/emailCampaignModel";
import NewsletterSubscriber from "@/models/newsletterSubscriberModel";
import User from "@/models/userModel";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletterAction(formData: FormData) {
  try {
    await connectDB();

    const session = await auth();

    const rawEmail =
      sanitize(formData.get("email")?.toString() || session?.user?.email || "")
        .toLowerCase() ||
      "";
    const rawName =
      sanitize(formData.get("name")?.toString() || session?.user?.name || "") ||
      "";

    const rateLimit = applyRateLimit(
      buildRateLimitKey(["newsletter-subscribe", rawEmail || "anonymous"]),
      { limit: 5, windowMs: 30 * 60 * 1000 }
    );

    if (!rateLimit.allowed) {
      return {
        success: false,
        message: `Too many subscription attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
      };
    }

    if (!rawEmail || !emailPattern.test(rawEmail)) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      };
    }

    const [existingUser, existingGuest] = await Promise.all([
      User.findOne({ email: rawEmail }),
      NewsletterSubscriber.findOne({ email: rawEmail }),
    ]);
    const now = new Date();
    const guestWasSubscribed = existingGuest?.subscribed ?? false;
    const userWasSubscribed = existingUser?.newsletter?.subscribed ?? false;

    if (existingUser) {
      const updateResult = await User.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            "newsletter.subscribed": true,
            "newsletter.source":
              session?.user?.id === existingUser._id.toString()
                ? "account"
                : existingUser.newsletter?.source ?? "footer",
            "newsletter.subscribedAt": now,
            "newsletter.unsubscribedAt": null,
            "newsletter.lastCampaignSentAt":
              existingUser.newsletter?.lastCampaignSentAt ?? null,
            "newsletter.lastCampaignSubject":
              existingUser.newsletter?.lastCampaignSubject ?? null,
          },
        }
      );

      if (updateResult.matchedCount === 0) {
        return {
          success: false,
          message: "Unable to save newsletter subscription right now.",
        };
      }

      await NewsletterSubscriber.deleteMany({ email: rawEmail });

      revalidatePath("/");
      revalidatePath("/home");
      revalidatePath("/account");
      revalidatePath("/admin/newsletter");

      return {
        success: true,
        message:
          userWasSubscribed || guestWasSubscribed
            ? "This registered account is already subscribed to the newsletter."
            : "Newsletter preference updated for the registered account.",
      };
    }

    const guestRecord = await NewsletterSubscriber.findOneAndUpdate(
      { email: rawEmail },
      {
        $set: {
          email: rawEmail,
          name: rawName || null,
          subscribed: true,
          source: "footer",
          subscribedAt: now,
          unsubscribedAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!guestRecord) {
      return {
        success: false,
        message: "Unable to save newsletter subscription right now.",
      };
    }

    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/account");
    revalidatePath("/admin/newsletter");

    return {
      success: true,
      message:
        guestWasSubscribed
          ? "This guest email is already subscribed to the newsletter."
          : "Guest newsletter subscription saved successfully.",
    };
  } catch (error) {
    console.error("subscribeToNewsletterAction failed:", error);
    return {
      success: false,
      message: "Unable to save newsletter subscription right now.",
    };
  }
}

export async function unsubscribeFromNewsletterAction(token: string) {
  try {
    await connectDB();

    const { valid, email } = verifyNewsletterUnsubscribeToken(token);

    if (!valid || !email) {
      return {
        success: false,
        message: "This unsubscribe link is invalid or has been tampered with.",
      };
    }

    const [user, guest] = await Promise.all([
      User.findOne({ email }),
      NewsletterSubscriber.findOne({ email }),
    ]);
    const now = new Date();

    if (!user && !guest) {
      return {
        success: false,
        message: "No newsletter subscription was found for this email.",
      };
    }

    if (user) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            "newsletter.subscribed": false,
            "newsletter.source": user.newsletter?.source ?? "footer",
            "newsletter.subscribedAt": user.newsletter?.subscribedAt ?? null,
            "newsletter.unsubscribedAt": now,
            "newsletter.lastCampaignSentAt": user.newsletter?.lastCampaignSentAt ?? null,
            "newsletter.lastCampaignSubject": user.newsletter?.lastCampaignSubject ?? null,
          },
        }
      );
      await NewsletterSubscriber.deleteMany({ email });
    }

    if (guest && !user) {
      await NewsletterSubscriber.updateOne(
        { _id: guest._id },
        {
          $set: {
            subscribed: false,
            unsubscribedAt: now,
          },
        }
      );
    }

    revalidatePath("/admin/newsletter");
    revalidatePath("/account");
    revalidatePath("/");
    revalidatePath("/home");

    return {
      success: true,
      message: "You have been unsubscribed from newsletter emails.",
    };
  } catch (error) {
    console.error("unsubscribeFromNewsletterAction failed:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to unsubscribe right now.",
    };
  }
}

export async function getPublishedPromotionsAction() {
  "use cache";

  cacheLife("hours");
  cacheTag("promotions");
  cacheTag("homepage");

  try {
    await connectDB();

    const campaigns = await EmailCampaign.find({
      publishedToSite: true,
      status: { $in: ["completed", "partial"] },
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return {
      success: true,
      data: campaigns.map((campaign) => ({
        id: String(campaign._id),
        slug: campaign.slug,
        subject: campaign.subject,
        previewText: campaign.previewText ?? "",
        body: campaign.body,
        ctaLabel: campaign.ctaLabel ?? "",
        ctaUrl: campaign.ctaUrl ?? "",
        targetPath: (campaign as { targetPath?: string | null }).targetPath ?? "",
        targetLabel: (campaign as { targetLabel?: string | null }).targetLabel ?? "",
        publishedAt: campaign.publishedAt ?? campaign.createdAt,
        audience: campaign.audience,
      })),
    };
  } catch (error) {
    console.error("getPublishedPromotionsAction failed:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load promotions.",
      data: [],
    };
  }
}

export async function getPromotionBySlugAction(slug: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("promotions");
  cacheTag(`promotion:${slug}`);

  try {
    await connectDB();

    const campaign = await EmailCampaign.findOne({
      slug,
      publishedToSite: true,
      status: { $in: ["completed", "partial"] },
    }).lean<{
      _id: unknown;
      slug: string;
      subject: string;
      previewText?: string | null;
      body: string;
      ctaLabel?: string | null;
      ctaUrl?: string | null;
      publishedAt?: Date | null;
      createdAt: Date;
      audience: string;
    } | null>();

    if (!campaign) {
      return {
        success: false,
        message: "Promotion not found.",
        data: null,
      };
    }

    return {
      success: true,
      data: {
        id: String(campaign._id),
        slug: campaign.slug,
        subject: campaign.subject,
        previewText: campaign.previewText ?? "",
        body: campaign.body,
        ctaLabel: campaign.ctaLabel ?? "",
        ctaUrl: campaign.ctaUrl ?? "",
        targetPath: (campaign as { targetPath?: string | null }).targetPath ?? "",
        targetLabel: (campaign as { targetLabel?: string | null }).targetLabel ?? "",
        publishedAt: campaign.publishedAt ?? campaign.createdAt,
        audience: campaign.audience,
      },
    };
  } catch (error) {
    console.error("getPromotionBySlugAction failed:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load this promotion.",
      data: null,
    };
  }
}
