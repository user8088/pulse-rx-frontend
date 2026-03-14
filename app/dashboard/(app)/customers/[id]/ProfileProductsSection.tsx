"use client";

import { useState, useMemo } from "react";
import { removeProfileProductAction, addProfileProductAction, addProfileProductsFromOrderAction } from "../actions";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { ConfirmingSubmitButton } from "@/components/ui/ConfirmingSubmitButton";
import type { ProfileProduct } from "@/types/customer";
import type { Product } from "@/types/product";
import type { Order } from "@/types/order";

export function ProfileProductsSection({
  customerId,
  profileId,
  profileName,
  initialProducts,
  products,
  orders,
}: {
  customerId: number | string;
  profileId: number;
  profileName: string;
  initialProducts: ProfileProduct[];
  products: Product[];
  orders: Order[];
}) {
  const [productSearch, setProductSearch] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showFromOrder, setShowFromOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 50);
    const q = productSearch.trim().toLowerCase();
    return products
      .filter(
        (p) =>
          p.item_name?.toLowerCase().includes(q) ||
          p.item_id?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [products, productSearch]);

  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
        Products
      </div>
      {initialProducts.length === 0 ? (
        <p className="text-sm text-gray-500">No products in this profile.</p>
      ) : (
        <ul className="space-y-2">
          {initialProducts.map((pp) => (
            <li
              key={`${pp.product_id}-${pp.quantity}`}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-gray-900">
                {pp.product?.item_name ?? `Product #${pp.product_id}`}
                {pp.quantity > 1 ? ` × ${pp.quantity}` : ""}
              </span>
              <form action={removeProfileProductAction}>
                <input type="hidden" name="customer_id" value={customerId} />
                <input type="hidden" name="profile_id" value={profileId} />
                <input type="hidden" name="product_id" value={pp.product_id} />
                <ConfirmingSubmitButton
                  confirmMessage="Remove this product from the profile?"
                  pendingText="Removing…"
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Remove
                </ConfirmingSubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}

      {/* Add from catalog: searchable product list */}
      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-gray-600">Add from catalog</p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="relative min-w-[200px] flex flex-col">
            <label htmlFor="profile-product-search" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              Product
            </label>
            <input
              id="profile-product-search"
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onFocus={() => setProductDropdownOpen(true)}
              onBlur={() => setTimeout(() => setProductDropdownOpen(false), 200)}
              placeholder="Search by name or ID…"
              className="h-9 w-full rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
            />
            {productDropdownOpen && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                {filteredProducts.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-500">No products match</div>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedProductId(String(p.id));
                        setProductSearch(p.item_name ?? "");
                        setProductDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        selectedProductId === String(p.id) ? "bg-gray-100 font-medium" : ""
                      }`}
                    >
                      {p.item_name} <span className="text-gray-400">({p.item_id})</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="profile-product-qty" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              Qty
            </label>
            <input
              id="profile-product-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="h-9 w-20 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
            />
          </div>
          <form action={addProfileProductAction} className="inline">
            <input type="hidden" name="customer_id" value={customerId} />
            <input type="hidden" name="profile_id" value={profileId} />
            <input type="hidden" name="product_id" value={selectedProductId || ""} />
            <input type="hidden" name="quantity" value={quantity} />
            <PendingSubmitButton
              pendingText="Adding…"
              disabled={!selectedProductId}
              className="h-9 rounded-xl bg-[#01AC28] text-white px-4 text-xs font-bold uppercase tracking-wider hover:bg-[#044644] focus:ring-2 focus:ring-[#01AC28] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </PendingSubmitButton>
          </form>
        </div>
      </div>

      {/* Add from order */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setShowFromOrder((v) => !v)}
          className="text-xs font-semibold text-[#01AC28] hover:underline"
        >
          {showFromOrder ? "− Hide" : "+ Add from order"}
        </button>
        {showFromOrder && (
          <div className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Choose order</label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setSelectedItemIds([]);
                }}
                className="w-full max-w-xs h-9 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
              >
                <option value="">Select an order…</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.order_number} — Rs. {o.total} — {new Date(o.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            {selectedOrderId && orders.find((o) => String(o.id) === selectedOrderId) && (
              <form action={addProfileProductsFromOrderAction}>
                <input type="hidden" name="customer_id" value={customerId} />
                <input type="hidden" name="profile_id" value={profileId} />
                <input type="hidden" name="order_id" value={selectedOrderId} />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Select items to add</p>
                  {orders
                    .find((o) => String(o.id) === selectedOrderId)
                    ?.items?.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="order_item_ids[]"
                          value={item.id}
                          checked={selectedItemIds.includes(item.id)}
                          onChange={(e) =>
                            setSelectedItemIds((prev) =>
                              e.target.checked
                                ? [...prev, item.id]
                                : prev.filter((id) => id !== item.id)
                            )
                          }
                        />
                        <span>
                          {item.item_name} × {item.quantity} — Rs. {item.line_total}
                        </span>
                      </label>
                    ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Leave all unchecked to add all items from this order.
                </p>
                <PendingSubmitButton
                  pendingText="Adding…"
                  className="mt-2 h-9 rounded-xl bg-[#01AC28] text-white px-4 text-xs font-bold uppercase tracking-wider hover:bg-[#044644]"
                >
                  Add selected to profile
                </PendingSubmitButton>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
