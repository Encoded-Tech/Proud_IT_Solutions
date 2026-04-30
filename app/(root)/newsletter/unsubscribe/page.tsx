import NewsletterUnsubscribeClient from "@/components/client/NewsletterUnsubscribeClient";
import { buildNoIndexMetadata } from "@/app/seo/utils/metadata";

export const metadata = buildNoIndexMetadata({
  title: "Newsletter Unsubscribe",
  description: "Manage newsletter subscription preferences.",
  path: "/newsletter/unsubscribe",
});

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="mx-4 my-12 max-w-4xl xl:mx-auto">
      {token ? (
        <NewsletterUnsubscribeClient token={token} />
      ) : (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-8 text-amber-800">
          This unsubscribe link is missing required information.
        </div>
      )}
    </main>
  );
}
