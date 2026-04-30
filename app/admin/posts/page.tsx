import React from "react";
import { getAllMedia } from "@/lib/server/actions/admin/media/mediaActions";
import { AnyMediaItem } from "@/types/media";
import AdminMediaTable, { MediaItem } from "@/components/admin/AdminPostTable";
import { mapAnyMediaToTableMedia } from "@/lib/server/mappers/MapMedia";
import { connection } from "next/server";

export default async function AdminPostsPage() {
  await connection();
  const res = await getAllMedia();
  const media: AnyMediaItem[] = res.success && res.data ? res.data : [];

  // ✅ Convert to MediaItem[] expected by the table
  const tableMedia: MediaItem[] = mapAnyMediaToTableMedia(media);

  return (
    <div className="p-6">
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-red-50 p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">
          Ads Placement Guide
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          Upload media that appears across the homepage
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Use the homepage placements to fill hero banners, top and mid-page promotions, and footer ad slots. The same media library also powers the product-section promos.
        </p>
      </div>

      <AdminMediaTable initialData={tableMedia} />
    </div>
  );
}
