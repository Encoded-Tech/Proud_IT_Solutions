"use client";

import Image from "@/components/ui/optimized-image";
import { CCTV_PART_LABELS, CCTV_PART_TYPES, CctvPartType } from "@/constants/cctv";
import {
  CctvPartInput,
  createCctvPart,
  updateCctvPart,
} from "@/lib/server/actions/admin/cctv/cctvAdminActions";
import { CctvPartMapped } from "@/lib/server/mappers/MapCctv";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  part?: CctvPartMapped;
  onSuccess?: (part: CctvPartMapped) => void;
}

export default function CctvPartForm({ part, onSuccess }: Props) {
  const [formData, setFormData] = useState<CctvPartInput>({
    name: part?.name || "",
    type: part?.type || "camera",
    brand: part?.brand || "",
    modelName: part?.modelName || "",
    description: part?.description || "",
    price: part?.price ?? 0,
    isRequired: part?.isRequired ?? false,
    isActive: part?.isActive ?? true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(part?.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) fd.append(key, String(value));
      });
      if (imageFile) fd.append("imageFile", imageFile);

      const res = part?.id ? await updateCctvPart(part.id, fd) : await createCctvPart(fd);
      if (!res.success || !res.data) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      onSuccess?.(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">
          {part ? "Edit CCTV Item" : "Add CCTV Item"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage CCTV installation items, pricing and availability.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Item Name
          <input
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            className="mt-1 h-11 w-full rounded-lg border px-3 text-sm"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Item Type
          <select
            value={formData.type}
            onChange={(event) =>
              setFormData((current) => ({ ...current, type: event.target.value as CctvPartType }))
            }
            className="mt-1 h-11 w-full rounded-lg border px-3 text-sm"
            required
          >
            {CCTV_PART_TYPES.map((type) => (
              <option key={type} value={type}>
                {CCTV_PART_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Price (NPR)
          <input
            type="number"
            min={0}
            value={formData.price}
            onChange={(event) =>
              setFormData((current) => ({ ...current, price: Number(event.target.value) }))
            }
            className="mt-1 h-11 w-full rounded-lg border px-3 text-sm"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Brand
          <input
            value={formData.brand || ""}
            onChange={(event) => setFormData((current) => ({ ...current, brand: event.target.value }))}
            className="mt-1 h-11 w-full rounded-lg border px-3 text-sm"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Model
          <input
            value={formData.modelName || ""}
            onChange={(event) =>
              setFormData((current) => ({ ...current, modelName: event.target.value }))
            }
            className="mt-1 h-11 w-full rounded-lg border px-3 text-sm"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 md:col-span-2">
          Description
          <textarea
            value={formData.description || ""}
            onChange={(event) =>
              setFormData((current) => ({ ...current, description: event.target.value }))
            }
            className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-slate-100">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt={formData.name || "CCTV item"}
              fill
              sizes="(max-width: 768px) 100vw, 220px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Camera className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleImage(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </button>
          {imagePreview && (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="ml-2 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          )}
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, isRequired: event.target.checked }))
                }
              />
              Required item
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
              Active
            </label>
          </div>
        </div>
      </div>

      <button
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {part ? "Update CCTV Item" : "Create CCTV Item"}
      </button>
    </form>
  );
}
