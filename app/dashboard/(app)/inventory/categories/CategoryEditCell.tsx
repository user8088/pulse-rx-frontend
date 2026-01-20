"use client";

import React, { useState } from "react";
import { Edit2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { updateCategory } from "./actions";
import { Category } from "@/types";

export function CategoryEditCell({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <form
        action={async (formData) => {
          await updateCategory(formData);
          setIsEditing(false);
        }}
        className="flex items-center gap-2"
      >
        <input type="hidden" name="id" value={category.id} />
        <Input
          name="category_name"
          defaultValue={category.category_name}
          className="h-8 py-1 text-sm min-w-[150px]"
          autoFocus
          required
        />
        <div className="flex gap-1">
          <PendingSubmitButton
            variant="primary"
            size="sm"
            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
            pendingText=""
          >
            <Check className="h-4 w-4" />
          </PendingSubmitButton>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 group/cell">
      <div className="font-bold text-[#111827]">{category.category_name}</div>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover/cell:opacity-100 p-1 text-gray-400 hover:text-[#01AC28] transition-all"
        title="Edit name"
      >
        <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
          <Edit2 className="h-3 w-3" />
        </div>
      </button>
    </div>
  );
}
