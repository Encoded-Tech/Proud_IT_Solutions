import Image from "@/components/ui/optimized-image";
import Link from "next/link";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";
import { connection } from "next/server";
import ProductCard from "@/components/card/product-card";
import {
  CategoryBrowseCard,
  fetchCategoryBrowseData,
} from "@/lib/server/fetchers/fetchCategoryBrowser";

export async function generateMetadata(): Promise<Metadata> {
  "use cache";

  return {
    title: "Shop Categories",
    description: "Browse product categories and subcategories.",
  };
}

type PageProps = {
  params: Promise<{
    segments?: string[];
  }>;
};

export async function generateStaticParams() {
  return [{ segments: [] }];
}

export default async function CategoryBrowsePage({ params }: PageProps) {
  const { segments = [] } = await params;
  const data = await fetchCategoryBrowseData(segments);
  const isProductView = !data.notFound && data.categories.length === 0;
  const isInsideCategory = data.breadcrumbs.length > 1;

  return (
    <main className="mx-4 my-8 max-w-7xl space-y-8 xl:mx-auto">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 px-5 py-4">
          <Breadcrumbs items={data.breadcrumbs} />
        </div>

        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1fr_260px] lg:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
              BROWSE PRODUCTS
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-4xl">
              {data.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              {data.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center lg:grid-cols-1 lg:text-left">
            <Stat label="Products" value={data.totalProductCount} />
            <Stat label="Categories" value={data.categories.length} />
            <Stat label="Quick Filters" value={data.shortcutCategories.length} />
          </div>
        </div>
      </section>

      {data.notFound ? (
        <EmptyState
          title="No category found"
          message="This category is inactive, empty, or no longer exists."
          actionHref="/shop/categories"
          actionLabel="Browse categories"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <Panel title="Browse">
              <div className="space-y-2">
                <Link
                  href="/shop/categories"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                >
                  All Categories
                </Link>
                {data.breadcrumbs.slice(1).map((crumb) => (
                  <Link
                    key={crumb.href}
                    href={crumb.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                  >
                    {crumb.label}
                  </Link>
                ))}
              </div>
            </Panel>

            {data.shortcutCategories.length > 0 && (
              <Panel title="Shop by specification">
                <div className="flex flex-wrap gap-2">
                  {data.shortcutCategories.map((category) => (
                    <ShortcutChip key={`${category.href}-${category.id}`} category={category} />
                  ))}
                </div>
              </Panel>
            )}
          </aside>

          <section className="space-y-8">
            {data.categories.length > 0 && (
              <div className="space-y-4">
                <SectionHeader
                  title={isInsideCategory ? "More Specific Options" : "Explore Categories"}
                  description={
                    isInsideCategory
                      ? "Select a subcategory to narrow your results."
                      : "Choose a category to view matching products, or open a category to see more specific options."
                  }
                />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {data.categories.map((category) => (
                    <CategoryCard key={`${category.href}-${category.id}`} category={category} />
                  ))}
                </div>
              </div>
            )}

            {isProductView && (
              <div className="space-y-4">
                <SectionHeader
                  title={`Products in ${data.title}`}
                  description="View all products available in this category."
                />

                {data.products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                    {data.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No active products"
                    message="This category path exists, but there are no active products available right now."
                    actionHref="/shop/categories"
                    actionLabel="Browse another category"
                  />
                )}
              </div>
            )}
          </section>
        </div>
      )}
      <DynamicMarker />
    </main>
  );
}

function DynamicMarker() {
  const Connection = async () => {
    await connection();
    return null;
  };

  return (
    <Suspense>
      <Connection />
    </Suspense>
  );
}

function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <Link href="/shop" className="font-medium hover:text-red-600">
        Shop
      </Link>
      {items.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-2">
          <span className="text-slate-300">/</span>
          <Link href={crumb.href} className="font-medium hover:text-red-600">
            {crumb.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-semibold text-slate-950">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function CategoryCard({ category }: { category: CategoryBrowseCard }) {
  return (
    <Link
      href={category.href}
      className="group grid grid-cols-[116px_1fr] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg sm:grid-cols-1"
    >
      <figure className="relative min-h-32 bg-slate-100 sm:aspect-[4/3]">
        <Image
          src={category.categoryImage || "/not-found.png"}
          alt={category.categoryName}
          fill
          sizes="(max-width: 640px) 116px, (max-width: 1280px) 50vw, 33vw"
          loading="lazy"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </figure>

      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-semibold text-slate-950">
            {category.categoryName}
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {category.productCount} Product{category.productCount !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600 sm:flex">
          {category.categoryName.charAt(0).toUpperCase()}
        </span>
      </div>
    </Link>
  );
}

function ShortcutChip({ category }: { category: CategoryBrowseCard }) {
  return (
    <Link
      href={category.href}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      <span>{category.categoryName}</span>
      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
        {category.productCount}
      </span>
    </Link>
  );
}

function EmptyState({
  title,
  message,
  actionHref,
  actionLabel,
}: {
  title: string;
  message: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-semibold text-red-600">
        !
      </div>
      <p className="text-lg font-semibold text-slate-950">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>
      <Link
        href={actionHref}
        className="mt-5 inline-flex rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
