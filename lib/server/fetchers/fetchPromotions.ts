import { cacheLife, cacheTag } from "next/cache";
import {
  getPromotionBySlugAction,
  getPublishedPromotionsAction,
} from "@/lib/server/actions/public/newsletter/newsletterActions";

export async function fetchPublishedPromotions() {
  "use cache";

  cacheLife("hours");
  cacheTag("promotions");
  cacheTag("homepage");

  return getPublishedPromotionsAction();
}

export async function fetchPromotionBySlug(slug: string) {
  "use cache";

  cacheLife("hours");
  cacheTag("promotions");
  cacheTag(`promotion:${slug}`);

  return getPromotionBySlugAction(slug);
}
