import Link from "next/link";
import NewsletterSubscriptionForm from "@/components/client/NewsletterSubscriptionForm";

export default function HomeNewsletter() {
  return (
    <section className="mx-4 my-20 max-w-7xl xl:mx-auto">
      <div className="grid gap-6 overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-900 p-8 text-white md:p-10">
          <div className="pointer-events-none absolute -left-12 top-10 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-200">
              Member Updates
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-tight md:text-4xl">
              Promotions by email, and a public archive on the website.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200">
              Join the newsletter to receive launches, store offers, and campaign updates directly in your inbox. Every major promotion can also appear on the public promotions page for visitors who prefer browsing on-site.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Direct email offers", value: "Inbox first" },
                { label: "Public campaign archive", value: "/promotions" },
                { label: "One-click unsubscribe", value: "Always included" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-red-100">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/promotions"
                className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-red-50"
              >
                Explore Promotions
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Contact Sales Team
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/70 p-6 md:p-8">
          <NewsletterSubscriptionForm />
        </div>
      </div>
    </section>
  );
}
