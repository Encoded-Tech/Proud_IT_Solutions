import Link from "next/link";

export default function AdminCctvInstallPage() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Link
        href="/admin/cctv-install/parts"
        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <h1 className="text-2xl font-semibold text-slate-950">CCTV Items</h1>
        <p className="mt-2 text-sm text-slate-500">
          Add and manage cameras, NVR, PoE switches, storage, cables and installation service.
        </p>
      </Link>
      <Link
        href="/admin/cctv-install/orders"
        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
      >
        <h1 className="text-2xl font-semibold text-slate-950">Installation Orders</h1>
        <p className="mt-2 text-sm text-slate-500">
          Review customer CCTV requests, update statuses and add admin remarks.
        </p>
      </Link>
    </div>
  );
}
