"use client";

import Image from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  createHomeBottomTile,
  deleteHomeBottomTile,
  updateHomeBottomTile,
} from "@/lib/server/actions/admin/media/homeBottomTileActions";
import { HomeBottomTile } from "@/types/home-media";
import { ImageIcon, Loader2, Save, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type TileDraft = Omit<HomeBottomTile, "id" | "placement"> & {
  id?: string;
  fallbackImage: string;
};

const defaults: TileDraft[] = [
  {
    title: "Shop by Category",
    subtitle: "",
    imageUrl: "",
    fallbackImage: "/category/ct1.jpg",
    linkUrl: "/shop/categories",
    ctaText: "View",
    altText: "Shop by Category",
    sortOrder: 1,
    isActive: true,
  },
  {
    title: "Featured Brands",
    subtitle: "",
    imageUrl: "",
    fallbackImage: "/category/ct3.jpg",
    linkUrl: "/shop",
    ctaText: "View",
    altText: "Featured Brands",
    sortOrder: 2,
    isActive: true,
  },
  {
    title: "Trending Products",
    subtitle: "",
    imageUrl: "",
    fallbackImage: "/products/p2.jpg",
    linkUrl: "/shop?sort=trending",
    ctaText: "View",
    altText: "Trending Products",
    sortOrder: 3,
    isActive: true,
  },
  {
    title: "Best Deals",
    subtitle: "",
    imageUrl: "",
    fallbackImage: "/products/p4.jpg",
    linkUrl: "/promotions",
    ctaText: "View",
    altText: "Best Deals",
    sortOrder: 4,
    isActive: true,
  },
];

function TileForm({ tile, slot }: { tile: TileDraft; slot: number }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(tile.imageUrl || tile.fallbackImage);
  const [active, setActive] = useState(tile.isActive);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setPreview(tile.imageUrl || tile.fallbackImage);
    setActive(tile.isActive);
  }, [tile]);

  function selectImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Image must be 6 MB or smaller");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, image: "" }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("isActive", String(active));
    setPending(true);
    setErrors({});
    try {
      const result = tile.id
        ? await updateHomeBottomTile(tile.id, formData)
        : await createHomeBottomTile(formData);
      if (!result.success) {
        setErrors(result.errors || {});
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!tile.id || !window.confirm("Delete this tile? The frontend fallback will replace it.")) return;
    setPending(true);
    try {
      const result = await deleteHomeBottomTile(tile.id);
      result.success ? toast.success(result.message) : toast.error(result.message);
      if (result.success) router.refresh();
    } finally {
      setPending(false);
    }
  }

  const fieldClass = "mt-1 h-11 border-slate-300 bg-white";
  const errorText = (field: string) =>
    errors[field] ? <p className="mt-1 text-xs text-red-600">{errors[field]}</p> : null;

  return (
    <form onSubmit={save} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-44 bg-slate-100">
        <Image
          src={preview}
          alt={tile.altText || tile.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div className="text-white">
            <p className="text-xs font-semibold uppercase tracking-widest">Tile {slot}</p>
            <p className="font-bold">{tile.title}</p>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-white text-slate-900 hover:bg-slate-100"
            onClick={() => fileRef.current?.click()}
          >
            <Upload /> Change image
          </Button>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <input
          ref={fileRef}
          name="image"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => selectImage(event.target.files?.[0])}
        />
        {errorText("image")}

        <label className="text-sm font-medium text-slate-700">
          Title *
          <Input name="title" defaultValue={tile.title} required maxLength={120} className={fieldClass} />
          {errorText("title")}
        </label>
        <label className="text-sm font-medium text-slate-700">
          Subtitle / eyebrow
          <Input name="subtitle" defaultValue={tile.subtitle} maxLength={120} className={fieldClass} />
          {errorText("subtitle")}
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Link URL
          <Input name="linkUrl" defaultValue={tile.linkUrl} maxLength={500} className={fieldClass} />
          {errorText("linkUrl")}
        </label>
        <label className="text-sm font-medium text-slate-700">
          CTA text
          <Input name="ctaText" defaultValue={tile.ctaText} maxLength={60} className={fieldClass} />
          {errorText("ctaText")}
        </label>
        <label className="text-sm font-medium text-slate-700">
          Sort order
          <Input name="sortOrder" type="number" min={0} max={9999} defaultValue={tile.sortOrder} required className={fieldClass} />
          {errorText("sortOrder")}
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Alt text
          <Input name="altText" defaultValue={tile.altText} maxLength={180} className={fieldClass} />
          {errorText("altText")}
        </label>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2">
          <div>
            <p className="text-sm font-semibold text-slate-800">Active</p>
            <p className="text-xs text-slate-500">Inactive tiles are replaced by a frontend fallback.</p>
          </div>
          <Switch
            checked={active}
            onCheckedChange={setActive}
            aria-label={`Toggle tile ${slot} status`}
            className="data-[state=checked]:bg-red-600"
          />
        </div>

        {!tile.id && !fileRef.current?.files?.length && (
          <p className="text-xs text-amber-700 sm:col-span-2">
            The preview is the current frontend fallback. Choose an image before the first save.
          </p>
        )}

        <div className="flex justify-end gap-2 sm:col-span-2">
          {tile.id && (
            <Button type="button" variant="outline" onClick={remove} disabled={pending} className="text-red-600">
              <Trash2 /> Delete
            </Button>
          )}
          <Button type="submit" disabled={pending} className="bg-red-600 hover:bg-red-700">
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {tile.id ? "Update tile" : "Save tile"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function HomeBottomTilesManager({ tiles }: { tiles: HomeBottomTile[] }) {
  const sorted = [...tiles].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 4);
  const slots: TileDraft[] = defaults.map((fallback, index) => {
    const tile = sorted[index];
    return tile ? { ...tile, fallbackImage: fallback.fallbackImage } : fallback;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <ImageIcon className="h-5 w-5 shrink-0" />
        The homepage renders up to four active tiles by sort order. Missing or inactive entries use the original static tiles.
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {slots.map((tile, index) => (
          <TileForm key={tile.id || `empty-${index}`} tile={tile} slot={index + 1} />
        ))}
      </div>
    </div>
  );
}
