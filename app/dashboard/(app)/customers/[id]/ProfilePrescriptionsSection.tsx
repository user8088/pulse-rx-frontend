"use client";

import { useState, useEffect } from "react";
import {
  uploadProfilePrescriptionAction,
  removeProfilePrescriptionAction,
  addProfilePrescriptionFromOrderAction,
  updateProfilePrescriptionAction,
} from "../actions";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { ConfirmingSubmitButton } from "@/components/ui/ConfirmingSubmitButton";
import type { ProfilePrescription } from "@/types/customer";
import type { Order } from "@/types/order";

function PrescriptionListItem({
  prescription: pr,
  customerId,
  profileId,
  onRemove,
  onUpdateName,
}: {
  prescription: ProfilePrescription;
  customerId: number | string;
  profileId: number;
  onRemove: (formData: FormData) => Promise<unknown>;
  onUpdateName: (formData: FormData) => Promise<unknown>;
}) {
  const [editingName, setEditingName] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const displayName = pr.name?.trim() || pr.file_name || `Prescription #${pr.id}`;

  async function handlePreview() {
    setPreviewLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/customers/${customerId}/profiles/${profileId}/prescriptions/${pr.id}/file`
      );
      if (!res.ok) throw new Error("Could not load file");
      const data = (await res.json()) as { url: string };
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      // Could show a toast; for now fail silently or alert
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm">
      <div className="flex-1 min-w-0">
        {editingName ? (
          <form
            action={async (formData) => {
              await onUpdateName(formData);
              setEditingName(false);
            }}
            className="flex items-center gap-2"
            onSubmit={() => setEditingName(false)}
          >
            <input type="hidden" name="customer_id" value={customerId} />
            <input type="hidden" name="profile_id" value={profileId} />
            <input type="hidden" name="prescription_id" value={pr.id} />
            <input
              type="text"
              name="name"
              defaultValue={pr.name ?? ""}
              placeholder="Name (optional)"
              maxLength={255}
              className="h-8 flex-1 min-w-0 max-w-xs rounded-lg border border-gray-200 px-2 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
              autoFocus
            />
            <PendingSubmitButton pendingText="Saving…" className="text-xs font-semibold text-[#01AC28] hover:text-[#044644]">
              Save
            </PendingSubmitButton>
            <button
              type="button"
              onClick={() => setEditingName(false)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </form>
        ) : (
          <span className="font-medium text-gray-900">{displayName}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!editingName && (
          <>
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewLoading}
              className="text-xs font-semibold text-gray-600 hover:text-[#01AC28] disabled:opacity-50"
            >
              {previewLoading ? "Opening…" : "Preview"}
            </button>
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-xs font-semibold text-gray-600 hover:text-[#01AC28]"
            >
              Edit name
            </button>
          </>
        )}
        <form action={async (formData) => {
          await onRemove(formData);
        }}>
          <input type="hidden" name="customer_id" value={customerId} />
          <input type="hidden" name="profile_id" value={profileId} />
          <input type="hidden" name="prescription_id" value={pr.id} />
          <ConfirmingSubmitButton
            confirmMessage="Remove this prescription from the profile?"
            pendingText="Removing…"
            className="text-xs font-semibold text-red-600 hover:text-red-700"
          >
            Remove
          </ConfirmingSubmitButton>
        </form>
      </div>
    </li>
  );
}

export function ProfilePrescriptionsSection({
  customerId,
  profileId,
  profileName,
  initialPrescriptions,
  orders,
}: {
  customerId: number | string;
  profileId: number;
  profileName: string;
  initialPrescriptions: ProfilePrescription[];
  orders: Order[];
}) {
  void profileName; // reserved for section heading
  const [showFromOrder, setShowFromOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  useEffect(() => {
    if (!selectedOrderId) {
      const t = setTimeout(() => setOrderDetail(null), 0);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    const loadId = setTimeout(() => setLoadingOrder(true), 0);
    fetch(`/api/dashboard/orders/${selectedOrderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setOrderDetail(data ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoadingOrder(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(loadId);
    };
  }, [selectedOrderId]);

  const prescriptionsFromOrder = orderDetail?.items?.flatMap((item) =>
    (item.prescriptions ?? []).map((pr) => ({
      ...pr,
      order_item_name: item.item_name,
    }))
  ) ?? [];

  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
        Prescriptions
      </div>
      {initialPrescriptions.length === 0 ? (
        <p className="text-sm text-gray-500">No prescriptions attached.</p>
      ) : (
        <ul className="space-y-2">
          {initialPrescriptions.map((pr) => (
            <PrescriptionListItem
              key={pr.id}
              prescription={pr}
              customerId={customerId}
              profileId={profileId}
              onRemove={removeProfilePrescriptionAction}
              onUpdateName={updateProfilePrescriptionAction}
            />
          ))}
        </ul>
      )}

      {/* Upload */}
      <div className="mt-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">Upload file</p>
        <form action={uploadProfilePrescriptionAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="customer_id" value={customerId} />
          <input type="hidden" name="profile_id" value={profileId} />
          <div className="flex flex-col">
            <label htmlFor="rx-upload-name" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              Name (optional)
            </label>
            <input
              id="rx-upload-name"
              type="text"
              name="name"
              placeholder="e.g. Metformin 500mg"
              maxLength={255}
              className="h-9 w-48 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
            />
          </div>
          <input
            type="file"
            name="file"
            accept="image/*,.pdf"
            required
            className="text-sm text-gray-700 file:mr-2 file:rounded-xl file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:text-xs file:font-bold file:text-gray-700 file:uppercase file:tracking-wider hover:file:bg-gray-300"
          />
          <PendingSubmitButton
            pendingText="Uploading…"
            className="h-9 rounded-xl bg-[#01AC28] text-white px-4 text-xs font-bold uppercase tracking-wider hover:bg-[#044644] focus:ring-2 focus:ring-[#01AC28] focus:ring-offset-2"
          >
            Upload
          </PendingSubmitButton>
        </form>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Choose order (with prescriptions)
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full max-w-xs h-9 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
              >
                <option value="">Select an order…</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.order_number} — {new Date(o.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            {loadingOrder && <p className="text-xs text-gray-500">Loading order…</p>}
            {selectedOrderId && !loadingOrder && (
              <>
                {prescriptionsFromOrder.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No prescriptions found on this order. Upload prescriptions on the order first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">
                      Prescriptions on this order — add to profile
                    </p>
                    {prescriptionsFromOrder.map((pr) => (
                      <div
                        key={pr.id}
                        className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm"
                      >
                        <span className="text-gray-900 flex-1 min-w-0">
                          {pr.file_name ?? `Prescription #${pr.id}`}
                          {pr.order_item_name && (
                            <span className="text-gray-500"> (from {pr.order_item_name})</span>
                          )}
                        </span>
                        <form action={addProfilePrescriptionFromOrderAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="customer_id" value={customerId} />
                          <input type="hidden" name="profile_id" value={profileId} />
                          <input type="hidden" name="prescription_id" value={pr.id} />
                          <div className="flex flex-col">
                            <label htmlFor={`rx-from-order-name-${pr.id}`} className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                              Name (optional)
                            </label>
                            <input
                              id={`rx-from-order-name-${pr.id}`}
                              type="text"
                              name="name"
                              placeholder="e.g. Blood sugar report"
                              maxLength={255}
                              className="h-8 w-40 rounded-lg border border-gray-200 px-2 text-sm focus:ring-2 focus:ring-[#01AC28] focus:border-transparent"
                            />
                          </div>
                          <PendingSubmitButton
                            pendingText="Adding…"
                            className="h-8 rounded-lg bg-[#01AC28] text-white px-3 text-xs font-bold uppercase tracking-wider hover:bg-[#044644]"
                          >
                            Add to profile
                          </PendingSubmitButton>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
