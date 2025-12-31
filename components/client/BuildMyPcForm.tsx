"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { UseCase } from "@/models/buildMyPcModel";
import { BuildMyPcInput, submitBuildMyPc } from "@/lib/server/actions/public/build-my-pc/buildMyPcactions";
import { addBuildRequest } from "@/redux/features/build-my-pc/buildMyPcSlice";
import toast from "react-hot-toast";

export default function BuildMyPcForm() {
  const dispatch = useDispatch();

  const [form, setForm] = useState<BuildMyPcInput>({
    name: "",
    phone: "",
    email: "",
    budgetNPR: undefined,
    uses: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = <K extends keyof BuildMyPcInput>(field: K, value: BuildMyPcInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await submitBuildMyPc({ ...form, uses: form.uses || [] });
      if (!result.success) {
        setError(result.message);
        toast.error(result.message);
      } else if (result.data) {
        dispatch(addBuildRequest(result.data));
        toast.success("Build request submitted successfully!");
        setForm({ name: "", phone: "", email: "", budgetNPR: undefined, uses: [] });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit build request";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {error && <p className="col-span-full text-red-500 text-center">{error}</p>}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={form.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Budget (NPR)"
          value={form.budgetNPR || ""}
          onChange={(e) => handleChange("budgetNPR", Number(e.target.value))}
          className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-gray-700 font-semibold">Select Uses</label>
        <select
          multiple
          value={form.uses || []}
          onChange={(e) =>
            handleChange(
              "uses",
              Array.from(e.target.selectedOptions, (option) => option.value as UseCase)
            )
          }
          className="border rounded-lg p-3 w-full h-40 focus:ring-2 focus:ring-blue-500"
        >
          <option value="gaming">Gaming</option>
          <option value="office">Office</option>
          <option value="content_creation">Content Creation</option>
          <option value="streaming">Streaming</option>
        </select>

        {/* Example: Add toggles for RGB and Small Form Factor */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.rgbPreference || false}
              onChange={(e) => handleChange("rgbPreference", e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
            <span>RGB Lighting</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.smallFormFactor || false}
              onChange={(e) => handleChange("smallFormFactor", e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
            <span>Small Form Factor</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded-lg w-full hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Submitting..." : "Submit Build Request"}
        </button>
      </div>
    </form>
  );
}
