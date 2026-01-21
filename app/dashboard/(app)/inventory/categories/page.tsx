import React from "react";
import { dashboardFetch } from "@/lib/dashboardApi";
import { PaginatedCategories } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { ConfirmingSubmitButton } from "@/components/ui/ConfirmingSubmitButton";
import { Pagination } from "@/components/ui/Pagination";
import { createCategory, updateCategory, deleteCategory } from "./actions";
import { Trash2 } from "lucide-react";
import { CategoryEditCell } from "./CategoryEditCell";

async function getCategories({
  page,
}: {
  page?: number;
}): Promise<PaginatedCategories | null> {
  try {
    const sp = new URLSearchParams();
    if (page && Number.isFinite(page)) sp.set("page", String(page));
    const qs = sp.toString();

    const res = await dashboardFetch(qs ? `/categories?${qs}` : "/categories");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string; error?: string; page?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const message = sp.message;
  const error = sp.error;
  const page = sp.page ? Number.parseInt(sp.page, 10) : undefined;

  const categoriesData = await getCategories({ page });
  const categories = categoriesData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
            Inventory
          </div>
          <h2 className="mt-1 text-2xl font-black text-[#374151]">Categories</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage product categories to keep your inventory organized.
          </p>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-red-100 bg-red-50 text-red-700"
              : "border-green-100 bg-green-50 text-green-700"
          }`}
        >
          {message || error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Create Category Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createCategory} className="space-y-4">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-extrabold text-[#374151] uppercase tracking-[0.2em]">
                    Category Name
                  </label>
                  <Input
                    name="category_name"
                    placeholder="e.g. Medical Supplies"
                    required
                  />
                </div>
                <PendingSubmitButton className="w-full" pendingText="Creating…">
                  Create Category
                </PendingSubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Alias / ID</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-sm text-gray-500">
                          No categories found.
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category.id} className="group hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <CategoryEditCell category={category} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm font-bold text-gray-700">
                              {category.alias}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {category.serial_id}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <form action={deleteCategory}>
                                <input type="hidden" name="id" value={category.id} />
                                <ConfirmingSubmitButton
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  confirmMessage={`Are you sure you want to delete "${category.category_name}"? This cannot be undone.`}
                                  pendingText=""
                                  showSpinner={true}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </ConfirmingSubmitButton>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {categoriesData ? (
        <Pagination
          basePath="/dashboard/inventory/categories"
          currentPage={categoriesData.current_page}
          lastPage={categoriesData.last_page}
          total={categoriesData.total}
          from={categoriesData.from}
          to={categoriesData.to}
        />
      ) : null}
    </div>
  );
}
