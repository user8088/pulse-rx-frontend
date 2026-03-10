import Link from "next/link";
import Image from "next/image";
import { getDashboardOrder } from "@/lib/api/dashboardOrders";
import type { Order } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusActions } from "./OrderStatusActions";
import PrescriptionReview from "./PrescriptionReview";

const STATUS_VARIANTS: Record<Order["status"], "success" | "warning" | "danger" | "neutral"> = {
  pending: "warning",
  confirmed: "neutral",
  processing: "neutral",
  out_for_delivery: "neutral",
  delivered: "success",
  cancelled: "danger",
};

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function deliveryDisplay(order: Order) {
  if (order.delivery_address) {
    return [order.delivery_address, order.delivery_city].filter(Boolean).join(", ");
  }
  if (order.address) {
    return [order.address.house_apt, order.address.street, order.address.block_locality, order.address.city]
      .filter(Boolean)
      .join(", ");
  }
  return "N/A";
}

export default async function DashboardOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ message?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const message = sp.message;

  const rawOrder = await getDashboardOrder(id);

  if (!rawOrder) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          Order not found.
        </div>
        <Link href="/dashboard/orders" className="text-sm font-semibold text-[#01AC28] hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  const order: Order = rawOrder;
  const canChangeStatus = order.status !== "cancelled" && order.status !== "delivered";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/orders"
            className="text-sm font-semibold text-gray-500 hover:text-[#01AC28] transition-colors"
          >
            &larr; Back to Orders
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#374151] font-mono">{order.order_number}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Placed {formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[order.status]}>
            {STATUS_LABELS[order.status]}
          </Badge>
          {canChangeStatus && <OrderStatusActions orderId={order.id} currentStatus={order.status} />}
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Customer</h2>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-[#374151]">{order.customer_name}</p>
            {order.customer_email && <p className="text-gray-600">{order.customer_email}</p>}
            <p className="text-gray-600">{order.customer_phone}</p>
            {order.customer_id && (
              <p className="text-xs text-gray-400 mt-1">Customer ID: {order.customer_id}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Delivery</h2>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-[#374151]">{order.delivery_name || order.customer_name}</p>
            <p className="text-gray-600">{order.delivery_phone || order.customer_phone}</p>
            <p className="text-gray-700 mt-1">{deliveryDisplay(order)}</p>
            {order.delivery_gender && (
              <p className="text-gray-600">Gender: {order.delivery_gender}</p>
            )}
            {order.delivery_latitude != null && order.delivery_longitude != null && (
              <p className="text-xs text-gray-400">
                Coords: {order.delivery_latitude}, {order.delivery_longitude}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">Rs. {order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">Rs. {order.shipping}</span>
            </div>
            {order.discount && Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-green-600">-Rs. {order.discount}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold">
              <span>Total</span>
              <span className="text-[#01AC28]">Rs. {order.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Payment</h2>
          <p className="text-sm font-semibold text-[#374151]">
            {order.payment_method === "cod" ? "Cash on Delivery" : "Card"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tier</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unit</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unit Price</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Qty</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const name = item.item_name || item.product_name || `Product #${item.product_id}`;
                const unitLabel = item.unit_label || item.tier_label || 'Unit';
                return (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                            <Image src={item.image_url} alt={name} fill className="object-contain p-1" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-gray-400">IMG</span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#374151]">{name}</p>
                          <p className="text-xs text-gray-400 font-mono">{item.item_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{unitLabel}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {item.quantity} x {unitLabel}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">Rs. {item.unit_price}</td>
                    <td className="px-6 py-4 text-sm font-medium">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-[#01AC28]">Rs. {item.line_total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescriptions section */}
      {(() => {
        const rxItemIds = order.items.map(i => i.id);
        const itemNames: Record<number, string> = {};
        for (const i of order.items) {
          itemNames[i.id] = i.item_name || i.product_name || `Product #${i.product_id}`;
        }
        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Prescriptions</h2>
            <PrescriptionReview orderId={order.id} rxItemIds={rxItemIds} itemNames={itemNames} />
          </div>
        );
      })()}

      {order.notes && (
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Order notes</p>
          <p className="text-sm text-amber-900">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
