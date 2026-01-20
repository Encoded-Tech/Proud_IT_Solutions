export const dynamic = "force-dynamic";
export const revalidate = 0;
import React from "react";
import { getAllMedia } from "@/lib/server/actions/admin/media/mediaActions";
import { AnyMediaItem } from "@/types/media";
import AdminMediaTable, { MediaItem } from "@/components/admin/AdminPostTable";
import { mapAnyMediaToTableMedia } from "@/lib/server/mappers/MapMedia";

export default async function AdminPostsPage() {
  const res = await getAllMedia();
  const media: AnyMediaItem[] = res.success && res.data ? res.data : [];

  // ✅ Convert to MediaItem[] expected by the table
  const tableMedia: MediaItem[] = mapAnyMediaToTableMedia(media);

  return (
    <div className="p-6">
     
      <AdminMediaTable initialData={tableMedia} />
    </div>
  );
}
