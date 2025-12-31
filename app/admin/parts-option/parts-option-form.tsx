"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { PartOptionInput } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { createPartOption, updatePartOption } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { mapPartOption } from "@/lib/server/mappers/MapPartsOption";
import Image from "next/image";

export type PartType =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "case"
  | "cooler"
  | "fan"
  | "monitor"
  | "keyboard"
  | "mouse"
  | "ups"
  | "headset"
  | "thermalPaste"
  | "captureCard"
  | "rgbAccessory"
  | "usbPort";

const PART_TYPE_OPTIONS: { label: string; value: PartType }[] = [
  { label: "CPU", value: "cpu" },
  { label: "GPU", value: "gpu" },
  { label: "Motherboard", value: "motherboard" },
  { label: "RAM", value: "ram" },
  { label: "Storage", value: "storage" },
  { label: "Power Supply", value: "psu" },
  { label: "Case", value: "case" },
  { label: "Cooler", value: "cooler" },
  { label: "Fan", value: "fan" },
  { label: "Monitor", value: "monitor" },
  { label: "Keyboard", value: "keyboard" },
  { label: "Mouse", value: "mouse" },
  { label: "UPS", value: "ups" },
  { label: "Headset", value: "headset" },
  { label: "Thermal Paste", value: "thermalPaste" },
  { label: "Capture Card", value: "captureCard" },
  { label: "RGB Accessory", value: "rgbAccessory" },
  { label: "USB Expansion / Port", value: "usbPort" },
];


interface Props {
  part?: PartOptionInput & { _id?: string; image?: string };
  onSuccess?: (part: ReturnType<typeof mapPartOption>) => void;
}

export default function PartForm({ part, onSuccess }: Props) {
  const [formData, setFormData] = useState<PartOptionInput>({
    name: part?.name || "",
    type: part?.type || "cpu",
    brand: part?.brand || "",
    price: part?.price || 0,
    modelName: part?.modelName || "",
    socket: part?.socket,
    chipset: part?.chipset,
    ramType: part?.ramType,
    wattage: part?.wattage,
    lengthMM: part?.lengthMM,
    storageType: part?.storageType,
    capacityGB: part?.capacityGB,
    isActive: part?.isActive ?? true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPartType, setSelectedPartType] = useState<PartType>("cpu");

  

 const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const target = e.target;

  if (target instanceof HTMLInputElement) {
    if (target.type === "checkbox") {
      // ✅ Only checkboxes have 'checked'
      setFormData(prev => ({
        ...prev,
        [target.name]: target.checked,
      }));
      return;
    }

    if (target.type === "number") {
      setFormData(prev => ({
        ...prev,
        [target.name]: target.value === "" ? undefined : Number(target.value),
      }));
      return;
    }

    // text input
    setFormData(prev => ({
      ...prev,
      [target.name]: target.value,
    }));
    return;
  }

  // select element
  if (target instanceof HTMLSelectElement) {
    setFormData(prev => ({
      ...prev,
      [target.name]: target.value,
    }));
    return;
  }
};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload
      const payload: PartOptionInput & { imageFile?: File } = { ...formData };
      if (imageFile) payload.imageFile = imageFile;

      // Choose action
      const res = part?._id
        ? await updatePartOption(part._id, payload)
        : await createPartOption(payload);

      if (res.success && onSuccess) onSuccess(res.data!); // ✅ Non-null assertion because data exists on success

      if (!part?._id) {
        setFormData({
          name: "",
          type: "cpu",
          brand: "",
          price: 0,
          modelName: "",
          isActive: true,
        });
        setImageFile(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save part option");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded-md space-y-4">
      <div className="flex space-x-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Part Name"
          className="flex-1 border p-2 rounded"
          required
        />
        <select
        className="border border-gray-200"
  value={selectedPartType}
  onChange={(e) => setSelectedPartType(e.target.value as PartType)}
>
  {PART_TYPE_OPTIONS.map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</select>

      </div>

      <input
        type="text"
        name="brand"
        value={formData.brand || ""}
        onChange={handleChange}
        placeholder="Brand"
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="modelName"
        value={formData.modelName || ""}
        onChange={handleChange}
        placeholder="Model Name"
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        name="price"
        value={formData.price ?? ""}
        onChange={handleChange}
        placeholder="Price"
        className="w-full border p-2 rounded"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
      />
      {part?.image && !imageFile && (
        <Image
          width={24}
          height={24}
          src={part.image}
          alt="Part"
          className="w-24 h-24 object-contain mt-2 rounded border"
        />
      )}

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive ?? true}
          onChange={handleChange}
        />
        <span>Active</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded text-white ${loading ? "bg-gray-400" : "bg-primary"}`}
      >
        {loading ? "Saving..." : part?._id ? "Update Part" : "Add Part"}
      </button>
    </form>
  );
}
