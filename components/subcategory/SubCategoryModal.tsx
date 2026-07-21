"use client";

import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, categoryId: string) => void;
  categories: Category[];
  initialData?: {
    name: string;
    categoryId: string;
  };
  loading?: boolean;
}

export default function SubCategoryModal({
  open,
  onClose,
  onSubmit,
  categories,
  initialData,
  loading = false,
}: Props) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategoryId(initialData.categoryId);
    } else {
      setName("");
      setCategoryId("");
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return alert("Enter subcategory name.");
    if (!categoryId) return alert("Select category.");

    onSubmit(name, categoryId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-[#8B5E34]">
            {initialData ? "Update Sub Category" : "Add Sub Category"}
          </h2>
        </div>

        <div className="space-y-5 p-6">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#8B5E34]"
            >
              <option value="">Select Category</option>

              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Sub Category Name
            </label>

            <input
              type="text"
              placeholder="Enter Sub Category"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#8B5E34]"
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 border-t p-5">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="rounded-lg bg-[#8B5E34] px-6 py-2 text-white hover:bg-[#714726]"
          >
            {loading
              ? "Saving..."
              : initialData
              ? "Update"
              : "Create"}
          </button>

        </div>

      </div>

    </div>
  );
}