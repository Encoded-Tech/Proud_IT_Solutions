"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { PartOptionInput } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { createPartOption, updatePartOption } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { mapPartOption } from "@/lib/server/mappers/MapPartsOption";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Cpu, 
  DollarSign, 
  ImageIcon, 
  Upload, 
  X, 
  Tag,
  Loader2,
  Check
} from "lucide-react";
import { Switch } from "@/components/ui/switch"; // NOT Radix directly

     import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Shadcn Select
import { PartType } from "@/constants/part";


interface Props {
  part?: PartOptionInput & { _id?: string; imageUrl?: string };
  onSuccess?: (part: ReturnType<typeof mapPartOption>) => void;
  partTypes?: readonly PartType[]; // dynamic types from server
}

export default function PartForm({ part, onSuccess, partTypes  }: Props) {
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
  const [imagePreview, setImagePreview] = useState<string | null>(part?.imageUrl || null);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isDragging, setIsDragging] = useState(false);
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
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
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

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setButtonState('loading');

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
        setButtonState('idle');
        return;
      }

      onSuccess?.(res.data!);
      toast.success(part?._id ? "Part updated successfully" : "Part added successfully");
      setButtonState('success');

      if (!part?._id) {
        setTimeout(() => {
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
          setButtonState('idle');
          router.push("/admin/build-user-pc/parts-table");
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save part option");
      setButtonState('idle');
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

  const hasConditionalFields = showConditionalField("socket") || 
    showConditionalField("chipset") || 
    showConditionalField("ramType") ||
    showConditionalField("wattage") || 
    showConditionalField("lengthMM") || 
    showConditionalField("storageType") ||
    showConditionalField("capacityGB");

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-8 py-10">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8 text-white" />
                <h1 className="text-4xl font-bold text-white">
                  {part?._id ? "Edit PC Part" : "Add New PC Part"}
                </h1>
              </div>
              <p className="text-red-100 text-lg">
                Configure component specifications and pricing details
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          </div>

          <div className="p-10 space-y-10">
            
            {/* Basic Information */}
            <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-300">
                <Package className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Part Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Intel Core i9-13900K"
                    className="w-full h-12 px-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl outline-none transition-all"
                    required
                  />
                </div>

           

<div>
  <label className="text-sm font-semibold text-gray-700 mb-2 block">
    Part Type *
  </label>
  <Select
  value={formData.type || ""}
  onValueChange={(value) =>
    setFormData(prev => ({ ...prev, type: value as PartType }))
  }
>
  <SelectTrigger className="w-full h-12  border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl">
    <SelectValue placeholder="Select a Part Type" />
  </SelectTrigger>
  <SelectContent>
    {partTypes?.map(type => (
      <SelectItem key={type} value={type}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

</div>


                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand || ""}
                    onChange={handleChange}
                    placeholder="e.g., Intel, AMD, NVIDIA"
                    className="w-full h-12 px-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Model Name
                  </label>
                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName || ""}
                    onChange={handleChange}
                    placeholder="e.g., RTX 4090"
                    className="w-full h-12 px-4 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-6 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-emerald-300">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-800">Pricing</h3>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Price (NPR) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price ?? ""}
                  onChange={handleChange}
                  placeholder="125000"
                  min="0"
                  step="0.01"
                  className="w-full h-12 px-4 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl outline-none transition-all text-lg font-semibold"
                  required
                />
              </div>
            </div>

            {/* Technical Specifications */}
            {hasConditionalFields && (
              <div className="space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-3 pb-4 border-b-2 border-purple-300">
                  <Cpu className="w-6 h-6 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-800">Technical Specifications</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {showConditionalField("socket") && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Socket Type
                      </label>
                      <input
                        type="text"
                        name="socket"
                        value={formData.socket || ""}
                        onChange={handleChange}
                        placeholder="e.g., LGA1700, AM5"
                        className="w-full h-12 px-4 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl outline-none transition-all"
                      />
                    </div>
                  )}

                  {showConditionalField("chipset") && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Chipset
                      </label>
                      <input
                        type="text"
                        name="chipset"
                        value={formData.chipset || ""}
                        onChange={handleChange}
                        placeholder="e.g., Z790, X670"
                        className="w-full h-12 px-4 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl outline-none transition-all"
                      />
                    </div>
                  )}

                  {showConditionalField("ramType") && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        RAM Type
                      </label>
                      <select
                        name="ramType"
                        value={formData.ramType || ""}
                        onChange={handleChange}
                        className="w-full h-12 px-4 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl outline-none transition-all bg-white"
                      >
                        <option value="">Select RAM Type</option>
                        <option value="DDR4">DDR4</option>
                        <option value="DDR5">DDR5</option>
                      </select>
                    </div>
                  )}

                  {showConditionalField("wattage") && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Wattage (W)
                      </label>
                      <input
                        type="number"
                        name="wattage"
                        value={formData.wattage ?? ""}
                        onChange={handleChange}
                        placeholder="e.g., 750"
                        min="0"
                        className="w-full h-12 px-4 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl outline-none transition-all"
                      />
                    </div>
                  )}

                  {showConditionalField("lengthMM") && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Length (mm)
                      </label>
                      <input
                        type="number"
                        name="lengthMM"
                        value={formData.lengthMM ?? ""}
                        onChange={handleChange}
                        placeholder="e.g., 336"
                        min="0"
                        className="w-full h-12 px-4 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl outline-none transition-all"
                      />
                    </div>
                  )}

                  {showConditionalField("storageType") && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Storage Type
                      </label>
                      <input
                        type="text"
                        name="storageType"
                        value={formData.storageType || ""}
                        onChange={handleChange}
                        placeholder="e.g., NVMe, SATA SSD"
                        className="w-full h-12 px-4 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl outline-none transition-all"
                      />
                    </div>
                  )}

                  {showConditionalField("capacityGB") && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Capacity (GB)
                      </label>
                      <input
                        type="number"
                        name="capacityGB"
                        value={formData.capacityGB ?? ""}
                        onChange={handleChange}
                        placeholder="e.g., 1000"
                        min="0"
                        className="w-full h-12 px-4 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Image */}
            <div className="space-y-6 bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-2xl border border-violet-200">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-violet-300">
                <ImageIcon className="w-6 h-6 text-violet-600" />
                <h3 className="text-2xl font-bold text-gray-800">Product Image</h3>
              </div>

              <div
                className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${
                  isDragging 
                    ? 'border-violet-600 bg-violet-200 scale-105' 
                    : 'border-violet-300 hover:border-violet-500 hover:bg-violet-100'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                  isDragging ? 'text-violet-600 animate-bounce' : 'text-violet-400 group-hover:text-violet-600'
                }`} />
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  {isDragging ? 'Drop image here!' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {imagePreview && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div className="relative aspect-square group">
                    <Image
                      src={imagePreview}
                      alt="Part preview"
                      fill
                      className="object-cover rounded-xl border-2 border-violet-200 group-hover:border-violet-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

<div className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
  <div>
    <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
      <Tag className="w-5 h-5 text-amber-600" />
      Part Status
    </p>
    <p className="text-sm text-gray-600 mt-1">
      {formData.isActive ? "This part is visible to customers" : "This part is hidden from customers"}
    </p>
  </div>

  <Switch 
    checked={formData.isActive}          // must be boolean
    onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, isActive: checked }))}
     className="data-[state=checked]:bg-green-600"
  />
</div>



            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/admin/build-user-pc/parts-table")}
                className="flex-1 h-14 text-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all"
                disabled={buttonState === 'loading'}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={buttonState === 'loading'}
                className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {buttonState === 'idle' && (
                  <span className="flex items-center justify-center gap-2">
                    {part?._id ? "Update Part" : "Add Part"}
                  </span>
                )}
                {buttonState === 'loading' && (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                )}
                {buttonState === 'success' && (
                  <Check className="w-6 h-6 mx-auto" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}