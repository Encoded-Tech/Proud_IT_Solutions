import HomeBottomTilesManager from "@/components/admin/HomeBottomTilesManager";
import { getAdminHomeBottomTiles } from "@/lib/server/actions/admin/media/homeBottomTileActions";
import { connection } from "next/server";

export default async function HomeMediaPage() {
  await connection();
  const response = await getAdminHomeBottomTiles();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-red-50 p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500">Home Media</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Home Bottom Tiles</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Manage the four horizontal cards displayed below the main home hero. Uploads use the existing Cloudinary media pipeline.
        </p>
      </div>
      <HomeBottomTilesManager tiles={response.data || []} />
    </div>
  );
}
