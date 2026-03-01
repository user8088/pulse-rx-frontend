"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Download, Plus, Search } from "lucide-react";
import { cn } from "@/utils/cn";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reorderPoint: number;
  price: number;
};

const MOCK_ITEMS: InventoryItem[] = [
  { id: "1", name: "MedRelief Fast-Acting Pain Killer 250mg", sku: "PRX-PAIN-250", category: "Pain Relief", stock: 128, reorderPoint: 30, price: 99 },
  { id: "2", name: "Solgar ESTER 100 PLUS 500mg (30 tabs)", sku: "PRX-VITC-500", category: "Vitamins", stock: 22, reorderPoint: 25, price: 43 },
  { id: "3", name: "AllergyCare Cetirizine 10mg", sku: "PRX-ALG-010", category: "Allergy", stock: 8, reorderPoint: 20, price: 18 },
  { id: "4", name: "Daily Omega-3 1000mg", sku: "PRX-OMG-1000", category: "Supplements", stock: 64, reorderPoint: 20, price: 27 },
  { id: "5", name: "Kids Multivitamin Gummies", sku: "PRX-KIDS-MV", category: "Vitamins", stock: 0, reorderPoint: 15, price: 21 },
];

function stockStatus(item: InventoryItem) {
  if (item.stock <= 0) return { label: "Out of stock", variant: "danger" as const };
  if (item.stock <= item.reorderPoint) return { label: "Low stock", variant: "warning" as const };
  return { label: "In stock", variant: "success" as const };
}

export default function InventoryClient() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_ITEMS;
    return MOCK_ITEMS.filter((i) => {
      return (
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const totals = useMemo(() => {
    const total = MOCK_ITEMS.length;
    const low = MOCK_ITEMS.filter((i) => i.stock > 0 && i.stock <= i.reorderPoint).length;
    const out = MOCK_ITEMS.filter((i) => i.stock <= 0).length;
    const value = MOCK_ITEMS.reduce((acc, i) => acc + i.stock * i.price, 0);
    return { total, low, out, value };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
            Dashboard
          </div>
          <h2 className="mt-1 text-2xl font-black text-[#374151]">Inventory</h2>
          <p className="mt-1 text-sm text-gray-600">
            Track stock levels, spot low inventory, and keep your catalog healthy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#111827]">{totals.total}</div>
            <div className="mt-2 text-xs text-gray-500">Active SKUs in catalog</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#111827]">{totals.low}</div>
            <div className="mt-2 text-xs text-gray-500">At or below reorder point</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Out of stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#111827]">{totals.out}</div>
            <div className="mt-2 text-xs text-gray-500">Needs restock immediately</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stock value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-[#111827]">Rs. {totals.value.toFixed(0)}</div>
            <div className="mt-2 text-xs text-gray-500">Approx. inventory valuation</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Items</CardTitle>
            <div className="text-xs text-gray-500">Search by name, SKU, or category.</div>
          </div>

          <div className="relative w-full lg:w-[420px]">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search inventory…"
              className="pl-11"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => {
                  const status = stockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#111827]">{item.name}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          Reorder point: <span className="font-semibold">{item.reorderPoint}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-700">{item.sku}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700">{item.category}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "text-sm font-bold",
                            item.stock <= 0
                              ? "text-red-700"
                              : item.stock <= item.reorderPoint
                                ? "text-yellow-700"
                                : "text-green-700"
                          )}
                        >
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-bold text-gray-700">Rs. {item.price.toFixed(2)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center">
              <div className="text-sm font-bold text-[#374151]">No results</div>
              <div className="mt-1 text-xs text-gray-500">Try a different search term.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

