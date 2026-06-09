import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <main className="mx-4 my-10 max-w-7xl space-y-8 md:space-y-12 xl:mx-auto">
      <Skeleton className="h-5 w-36" />

      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-6 w-44" />
          </div>
          <Skeleton className="hidden h-9 w-24 rounded-full sm:block" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-7">
        <aside className="hidden md:col-span-2 md:block">
          <div className="space-y-6 rounded-md bg-zinc-50 p-4 shadow-sm">
            <div className="flex justify-between border-b pb-4">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-5/6" />
              </div>
            ))}
          </div>
        </aside>
        <section className="md:col-span-5">
          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-xl border bg-white p-3 shadow-sm">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="mt-4 h-5 w-5/6" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </section>
      </div>
    </main>
  );
}
