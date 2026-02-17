"use client";

import React, { useEffect, useState } from "react";
import type { Subcategory } from "@/types";
import { getSubcategories } from "@/lib/api/categories";

interface SubcategorySelectProps {
  categoryId: number | string | null;
  selectedIds?: number[];
  name?: string;
}

export function SubcategorySelect({
  categoryId,
  selectedIds = [],
  name = "subcategory_ids[]",
}: SubcategorySelectProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedIds));

  useEffect(() => {
    setSelected(new Set(selectedIds));
  }, [selectedIds]);

  useEffect(() => {
    if (!categoryId || categoryId === "") {
      setSubcategories([]);
      setSelected(new Set());
      return;
    }

    let cancelled = false;
    setLoading(true);
    getSubcategories(categoryId, { per_page: 100 })
      .then((data) => {
        if (!cancelled) {
          setSubcategories(data.data);
          setSelected((prev) => {
            const validIds = new Set(data.data.map((s) => s.id));
            const filtered = new Set([...prev].filter((id) => validIds.has(id)));
            return filtered;
          });
        }
      })
      .catch(() => {
        if (!cancelled) setSubcategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!categoryId || categoryId === "") {
    return (
      <p className="text-[11px] text-gray-400 italic">
        Select a category first to see subcategories.
      </p>
    );
  }

  if (loading) {
    return <p className="text-[11px] text-gray-400">Loading subcategories...</p>;
  }

  if (subcategories.length === 0) {
    return (
      <p className="text-[11px] text-gray-400 italic">
        No subcategories for this category.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {[...selected].map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <div className="flex flex-wrap gap-1.5">
        {subcategories.map((sub) => {
          const isSelected = selected.has(sub.id);
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => toggle(sub.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                isSelected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {sub.subcategory_name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
