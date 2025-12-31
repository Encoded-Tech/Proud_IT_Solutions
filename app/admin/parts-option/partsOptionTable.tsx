"use client";

import { useState } from "react";
import Image from "next/image";
import { PartOptionInput } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import { deletePartOption } from "@/lib/server/actions/admin/BuildMyPc/partsAction";
import PartForm from "./parts-option-form";


interface Props {
    initialParts: (PartOptionInput & { _id?: string; image?: string })[];
}

export default function PartsTable({ initialParts }: Props) {
    const [parts, setParts] = useState(initialParts);
    const [editingPart, setEditingPart] = useState<typeof initialParts[0] | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState<string | null>(null);

    const handleEdit = (part: typeof initialParts[0]) => {
        setEditingPart(part);
        setShowModal(true);
    };

    const handleUpdate = (updated: typeof initialParts[0]) => {
        setParts(parts.map(p => (p._id === updated._id ? updated : p)));
        setEditingPart(null);
        setShowModal(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this part?")) return;
        try {
            setLoadingDelete(id);
            const res = await deletePartOption(id);
            if (res.success) {
                setParts(parts.filter((p) => p._id !== id));
            } else {
                alert(res.message || "Failed to delete part");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete part");
        } finally {
            setLoadingDelete(null);
        }
    };

    return (
        <div className="w-full">
            {showModal && editingPart && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-xl"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-semibold mb-4">Edit Part</h2>
                        <PartForm part={editingPart} onSuccess={handleUpdate} />
                    </div>
                </div>
            )}

            <div className="overflow-x-auto border rounded-md shadow-sm mt-4">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Image</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">Brand</th>
                            <th className="px-4 py-2 text-left">Price</th>
                            <th className="px-4 py-2 text-left">Active</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parts.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    No parts available
                                </td>
                            </tr>
                        )}

                        {parts.map((part) => (
                            <tr key={part._id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">
                                    {part.image ? (
                                        <Image
                                            src={part.image}
                                            alt={part.name}
                                            width={64}
                                            height={64}
                                            className="object-contain rounded border"
                                        />
                                    ) : (
                                        <span className="text-gray-400">No Image</span>
                                    )}
                                </td>
                                <td className="px-4 py-2">{part.name}</td>
                                <td className="px-4 py-2 capitalize">{part.type}</td>
                                <td className="px-4 py-2">{part.brand || "-"}</td>
                                <td className="px-4 py-2">{part.price ?? "-"}</td>
                                <td className="px-4 py-2">{part.isActive ? "Yes" : "No"}</td>
                                <td className="px-4 py-2 align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(part)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(part._id!)}
                                            disabled={loadingDelete === part._id}
                                            className={`px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition ${loadingDelete === part._id ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {loadingDelete === part._id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
