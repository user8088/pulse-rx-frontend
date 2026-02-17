"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Edit2, X, Check, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { ConfirmingSubmitButton } from "@/components/ui/ConfirmingSubmitButton";
import { createSubcategory, updateSubcategory, deleteSubcategory } from "./subcategoryActions";
import type { Subcategory } from "@/types";

interface SubcategorySectionProps {
  categoryId: number;
  subcategories: Subcategory[];
}

function SubcategoryEditRow({
  subcategory,
  categoryId,
}: {
  subcategory: Subcategory;
  categoryId: number;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <form
          action={async (formData) => {
            await updateSubcategory(formData);
            setIsEditing(false);
          }}
          className="flex items-center gap-2 flex-1"
        >
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="id" value={subcategory.id} />
          <Input
            name="subcategory_name"
            defaultValue={subcategory.subcategory_name}
            className="h-7 py-0.5 text-xs min-w-[120px] flex-1"
            autoFocus
            required
          />
          <PendingSubmitButton
            variant="primary"
            size="sm"
            className="h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-700 rounded-md"
            pendingText=""
          >
            <Check className="h-3 w-3" />
          </PendingSubmitButton>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 group/sub">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
        <span className="text-sm text-gray-700 truncate">{subcategory.subcategory_name}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-gray-400 hover:text-gray-700 transition-all"
          title="Edit"
        >
          <Edit2 className="h-3 w-3" />
        </button>
      </div>
      <form action={deleteSubcategory} className="opacity-0 group-hover/sub:opacity-100 transition-opacity">
        <input type="hidden" name="category_id" value={categoryId} />
        <input type="hidden" name="id" value={subcategory.id} />
        <ConfirmingSubmitButton
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
          confirmMessage={`Delete "${subcategory.subcategory_name}"?`}
          pendingText=""
          showSpinner={true}
        >
          <Trash2 className="h-3 w-3" />
        </ConfirmingSubmitButton>
      </form>
    </div>
  );
}

export function SubcategorySection({ categoryId, subcategories }: SubcategorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <span>
          {subcategories.length} subcategor{subcategories.length === 1 ? "y" : "ies"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 ml-1 pl-3 border-l-2 border-gray-100 space-y-0.5">
          {subcategories.length === 0 && !showAdd && (
            <p className="text-xs text-gray-400 py-1">No subcategories yet.</p>
          )}

          {subcategories.map((sub) => (
            <SubcategoryEditRow
              key={sub.id}
              subcategory={sub}
              categoryId={categoryId}
            />
          ))}

          {showAdd ? (
            <form
              action={async (formData) => {
                await createSubcategory(formData);
                setShowAdd(false);
              }}
              className="flex items-center gap-2 py-1.5"
            >
              <input type="hidden" name="category_id" value={categoryId} />
              <Input
                name="subcategory_name"
                placeholder="Subcategory name"
                className="h-7 py-0.5 text-xs flex-1"
                autoFocus
                required
              />
              <PendingSubmitButton
                variant="primary"
                size="sm"
                className="h-7 px-2.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 rounded-md"
                pendingText="…"
              >
                Add
              </PendingSubmitButton>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 py-1 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add subcategory
            </button>
          )}
        </div>
      )}
    </div>
  );
}
