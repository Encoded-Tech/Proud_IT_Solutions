
import { fetchBuildRequestById } from "@/lib/server/fetchers/fetchBuildRequest";
import { notFound } from "next/navigation";
import BuildRequestView from "./buildDetails";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; 

  if (!id) notFound();

  const res = await fetchBuildRequestById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <BuildRequestView build={res.data} />
      </div>
    </div>
  );
}
