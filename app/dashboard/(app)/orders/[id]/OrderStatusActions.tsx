"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronDown } from "lucide-react";
import { updateOrderStatusAction } from "../actions";
import type { OrderStatus } from "@/types/order";

const TRANSITIONS: Record<string, { status: OrderStatus; label: string }[]> = {
  pending: [
    { status: "confirmed", label: "Confirm order" },
    { status: "cancelled", label: "Cancel order" },
  ],
  confirmed: [
    { status: "processing", label: "Start processing" },
    { status: "cancelled", label: "Cancel order" },
  ],
  processing: [
    { status: "out_for_delivery", label: "Out for delivery" },
    { status: "cancelled", label: "Cancel order" },
  ],
  out_for_delivery: [
    { status: "delivered", label: "Mark delivered" },
    { status: "cancelled", label: "Cancel order" },
  ],
};

export function OrderStatusActions({
  orderId,
  currentStatus,
}: {
  orderId: number;
  currentStatus: OrderStatus;
}) {
  const [open, setOpen] = useState(false);

  const actions = TRANSITIONS[currentStatus] ?? [];
  if (actions.length === 0) return null;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="h-9 gap-1"
      >
        Update status <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            {actions.map(({ status, label }) => (
              <form key={status} action={updateOrderStatusAction}>
                <input type="hidden" name="id" value={orderId} />
                <input type="hidden" name="status" value={status} />
                <button
                  type="submit"
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {label}
                </button>
              </form>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
