"use client";

import Image from "next/image";
import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Search, Edit, FileImage, AlertTriangle, Video, ImageIcon, MapPin } from "lucide-react";
import toast from "react-hot-toast";

import { MediaPlacement, MediaType } from "@/types/media";
import { deleteMediaByPlacement } from "@/lib/server/actions/admin/media/mediaActions";
import MediaForm from "./AddPostForm";

export interface MediaItem {
  _id: string;
  url: string;
  type: MediaType;
  placement: MediaPlacement;
  createdAt: string;
}

export default function AdminMediaTable({
  initialData,
}: {
  initialData: MediaItem[];
}) {
  const mediaItems = initialData;
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<"all" | MediaType>("all");
  const [isPending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  const itemsPerPage = 12;

  const formatPlacementLabel = (placement: string) => {
    return placement.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // 🔍 Search & Filter
  const filtered = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesSearch = formatPlacementLabel(item.placement)
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [mediaItems, search, filterType]);

  // 🔃 Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      sortDir === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filtered, sortDir]);

  // 📄 Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // 🗑 Confirm delete
  const confirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const res = await deleteMediaByPlacement(deleteTarget.placement);

      if (!res.success) {
        toast.error("Failed to delete media");
        return;
      }

      toast.success("Media deleted successfully");
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const stats = {
    total: mediaItems.length,
    images: mediaItems.filter(item => item.type === 'image').length,
    videos: mediaItems.filter(item => item.type === 'video').length,
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              
              <div>
                <h2 className="text-3xl font-bold ">Media Library</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Manage website images and videos • {stats.total} total ({stats.images} images, {stats.videos} videos)
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                placeholder="Search by placement..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                 className="border px-12 py-4 rounded-lg text-lg w-80"
              />
              <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === "all"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterType("image")}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filterType === "image"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Images ({stats.images})
              </button>
              <button
                onClick={() => setFilterType("video")}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filterType === "video"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <Video className="w-4 h-4" />
                Videos ({stats.videos})
              </button>
            </div>

            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all font-medium text-gray-700"
            >
              Sort by Date {sortDir === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-8 py-4 text-left">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Preview
                  </span>
                </th>
                <th className="px-8 py-4 text-left">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Placement
                  </span>
                </th>
                <th className="px-8 py-4 text-center">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Type
                  </span>
                </th>
               
                <th className="px-8 py-4 text-right">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Created
                  </span>
                </th>
                <th className="px-8 py-4 text-center">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileImage className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold">No media found</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {search ? "Try adjusting your search" : "Get started by uploading new media"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors group">
                    
                    {/* Preview */}
                
<td className="px-8 py-5">
  <div className="relative w-24 h-16 rounded-xl overflow-hidden border-2 border-gray-200  shadow-sm">
    {item.type === 'image' ? (
      <Image
        src={item.url}
        alt={formatPlacementLabel(item.placement)}
        fill
        className="object-contain"
      />
    ) : (
      <video
        src={item.url}
        className="w-full h-full object-contain"
        controls
      />
    )}
  </div>
</td>


                    {/* Placement */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <p className="font-semibold text-gray-900">
                          {formatPlacementLabel(item.placement)}
                        </p>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${
                          item.type === 'image'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {item.type === 'image' ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : (
                            <Video className="w-4 h-4" />
                          )}
                          {item.type === 'image' ? 'Image' : 'Video'}
                        </span>
                      </div>
                    </td>

                    {/* URL */}
             

                    {/* Date */}
                    <td className="px-8 py-5 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditTarget(item)}
                         className="p-2 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                          title="Edit media"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteTarget(item)}
                             className="p-2 rounded bg-red-50 text-red-700 hover:bg-red-100"
                          title="Delete media"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{page}</span> of{" "}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <MediaForm
          media={editTarget}
          isModal={true}
          onCancel={() => setEditTarget(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Delete Media</h3>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-24 h-24 relative rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  {deleteTarget.type === 'image' ? (
                    <Image
                      src={deleteTarget.url}
                      alt={formatPlacementLabel(deleteTarget.placement)}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                      <video src={deleteTarget.url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-lg mb-1">
                    {formatPlacementLabel(deleteTarget.placement)}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold mb-2 ${
                    deleteTarget.type === 'image'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {deleteTarget.type === 'image' ? (
                      <ImageIcon className="w-3 h-3" />
                    ) : (
                      <Video className="w-3 h-3" />
                    )}
                    {deleteTarget.type.toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. This will permanently delete this media file.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Warning: This media is currently being used on your website.
                </p>
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-12 px-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                disabled={isPending}
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 h-12 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-60 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Media</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}