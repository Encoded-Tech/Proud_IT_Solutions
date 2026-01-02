"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { PartOptionInput } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { createPartOption, updatePartOption } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { mapPartOption } from "@/lib/server/mappers/MapPartsOption";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  part?: PartOptionInput & { _id?: string; imageUrl?: string };
  onSuccess?: (part: ReturnType<typeof mapPartOption>) => void;
}

export default function PartForm({ part, onSuccess }: Props) {

  const router = useRouter();
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;

    if (target instanceof HTMLInputElement) {
      if (target.type === "checkbox") {
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

      setFormData(prev => ({
        ...prev,
        [target.name]: target.value,
      }));
      return;
    }

    if (target instanceof HTMLSelectElement) {
      setFormData(prev => ({
        ...prev,
        [target.name]: target.value,
      }));
      return;
    }
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      for (const [key, value] of Object.entries(formData)) {
        if (value !== undefined && value !== null) {
          fd.append(key, String(value));
        }
      }

      if (imageFile) {
        fd.append("imageFile", imageFile);
      }

      const res = part?._id
        ? await updatePartOption(part._id, fd)
        : await createPartOption(fd);

      if (!res.success) {
        toast.error(res.message || "Failed to save part");
        return;
      }

      onSuccess?.(res.data!);

      // ✅ SUCCESS
      toast.success(
        part?._id ? "Part updated successfully" : "Part added successfully"
      );

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
        setImagePreview(null);
        if (!part?._id) {
          setTimeout(() => {
            router.push("/admin/build-user-pc/parts-table");
            router.refresh();
          }, 800);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save part option");
    } finally {
      setLoading(false);
    }
  };


  const showConditionalField = (field: string): boolean => {
    const fieldMap: Record<string, PartType[]> = {
      socket: ["cpu", "motherboard"],
      chipset: ["motherboard"],
      ramType: ["ram", "motherboard"],
      wattage: ["psu", "gpu"],
      lengthMM: ["gpu", "cooler", "case"],
      storageType: ["storage"],
      capacityGB: ["storage", "ram"],
    };
    return fieldMap[field]?.includes(formData.type) || false;
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
        <h2 className="text-2xl font-bold text-white">
          {part?._id ? "Edit PC Part" : "Add New PC Part"}
        </h2>
        <p className="text-red-100 text-sm mt-1">
          Fill in the details below to {part?._id ? "update" : "add"} a component
        </p>
      </div>

      <div className="p-8 space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-100 text-primary flex items-center justify-center text-sm font-bold">1</span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Part Name <span className="text-primary">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Intel Core i9-13900K"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Part Type <span className="text-primary">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-white"
                  required
                >
                  {PART_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (NPR) <span className="text-primary">*</span>
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price ?? ""}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  id="brand"
                  type="text"
                  name="brand"
                  value={formData.brand || ""}
                  onChange={handleChange}
                  placeholder="e.g., Intel, AMD, NVIDIA"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-2">
                  Model Name
                </label>
                <input
                  id="modelName"
                  type="text"
                  name="modelName"
                  value={formData.modelName || ""}
                  onChange={handleChange}
                  placeholder="e.g., RTX 4090"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          {(showConditionalField("socket") || showConditionalField("chipset") || showConditionalField("ramType") ||
            showConditionalField("wattage") || showConditionalField("lengthMM") || showConditionalField("storageType") ||
            showConditionalField("capacityGB")) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-red-100 text-primary flex items-center justify-center text-sm font-bold">2</span>
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {showConditionalField("socket") && (
                    <div>
                      <label htmlFor="socket" className="block text-sm font-medium text-gray-700 mb-2">
                        Socket Type
                      </label>
                      <input
                        id="socket"
                        type="text"
                        name="socket"
                        value={formData.socket || ""}
                        onChange={handleChange}
                        placeholder="e.g., LGA1700, AM5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  )}

                  {showConditionalField("chipset") && (
                    <div>
                      <label htmlFor="chipset" className="block text-sm font-medium text-gray-700 mb-2">
                        Chipset
                      </label>
                      <input
                        id="chipset"
                        type="text"
                        name="chipset"
                        value={formData.chipset || ""}
                        onChange={handleChange}
                        placeholder="e.g., Z790, X670"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  )}

                  {showConditionalField("ramType") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RAM Type
                      </label>
                      <select
                        name="ramType"
                        value={formData.ramType || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg"
                      >
                        <option value="">Select RAM Type</option>
                        <option value="DDR4">DDR4</option>
                        <option value="DDR5">DDR5</option>
                      </select>
                    </div>
                  )}


                  {showConditionalField("wattage") && (
                    <div>
                      <label htmlFor="wattage" className="block text-sm font-medium text-gray-700 mb-2">
                        Wattage (W)
                      </label>
                      <input
                        id="wattage"
                        type="number"
                        name="wattage"
                        value={formData.wattage ?? ""}
                        onChange={handleChange}
                        placeholder="e.g., 750"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  )}

                  {showConditionalField("lengthMM") && (
                    <div>
                      <label htmlFor="lengthMM" className="block text-sm font-medium text-gray-700 mb-2">
                        Length (mm)
                      </label>
                      <input
                        id="lengthMM"
                        type="number"
                        name="lengthMM"
                        value={formData.lengthMM ?? ""}
                        onChange={handleChange}
                        placeholder="e.g., 336"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  )}

                  {showConditionalField("storageType") && (
                    <div>
                      <label htmlFor="storageType" className="block text-sm font-medium text-gray-700 mb-2">
                        Storage Type
                      </label>
                      <input
                        id="storageType"
                        type="text"
                        name="storageType"
                        value={formData.storageType || ""}
                        onChange={handleChange}
                        placeholder="e.g., NVMe, SATA SSD"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  )}

                  {showConditionalField("capacityGB") && (
                    <div>
                      <label htmlFor="capacityGB" className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity (GB)
                      </label>
                      <input
                        id="capacityGB"
                        type="number"
                        name="capacityGB"
                        value={formData.capacityGB ?? ""}
                        onChange={handleChange}
                        placeholder="e.g., 1000"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Image Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-100 text-primary flex items-center justify-center text-sm font-bold">
                {showConditionalField("socket") || showConditionalField("chipset") ? "3" : "2"}
              </span>
              Product Image
            </h3>

            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                  ? "border-primary bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />

              {(imagePreview || (part?.imageUrl && !imageFile)) ? (
                <div className="space-y-4">
                  <Image
                    width={256}
                    height={256}
                    src={imagePreview || part?.imageUrl || ""}
                    alt="Part Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
                  />
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-primary bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary font-medium hover:text-red-700"
                    >
                      Click to upload
                    </button>
                    <span className="text-gray-600"> or drag and drop</span>
                  </div>
                  <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                Active Status
              </label>
              <p className="text-sm text-gray-500 mt-0.5">
                {formData.isActive ? "This part is visible to customers" : "This part is hidden from customers"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive ?? true}
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${formData.isActive ? "bg-primary" : "bg-gray-200"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-red-700 focus:ring-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {part?._id ? "Update Part" : "Add Part"}
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
