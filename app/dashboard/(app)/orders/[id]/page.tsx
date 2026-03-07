import Link from "next/link";
import Image from "next/image";
import { getDashboardOrder } from "@/lib/api/dashboardOrders";
import type { Order } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusActions } from "./OrderStatusActions";

const STATUS_VARIANTS: Record<Order["status"], "success" | "warning" | "danger" | "neutral"> = {
  pending: "warning",
  confirmed: "neutral",
  delivered: "success",
  cancelled: "danger",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
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

  const order = await getDashboardOrder(id);

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          Order not found.
        </div>
        <Link href="/dashboard/orders" className="text-sm font-semibold text-[#01AC28] hover:underline">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const canChangeStatus = order.status !== "cancelled" && order.status !== "delivered";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/orders"
            className="text-sm font-semibold text-gray-500 hover:text-[#01AC28] transition-colors"
          >
            ← Back to Orders
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#374151] font-mono">{order.order_number}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Placed {formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[order.status]}>{order.status}</Badge>
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
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Customer &amp; Address</h2>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-[#374151]">{order.customer_name}</p>
            {order.customer_email && <p className="text-gray-600">{order.customer_email}</p>}
            <p className="text-gray-600">{order.customer_phone}</p>
            <div className="pt-3 mt-3 border-t border-gray-100">
              <p className="text-gray-700">
                {order.address.house_apt}, {order.address.street}
              </p>
              <p className="text-gray-700">
                {order.address.block_locality}, {order.address.city}
              </p>
              <p className="text-gray-600">Phone: {order.address.phone}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</p>
            <p className="text-sm font-semibold text-[#374151]">{order.payment_method === "cod" ? "Cash on Delivery" : "Card"}</p>
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
              <span className="text-gray-500">Tax</span>
              <span className="font-medium">Rs. {order.tax}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">Rs. {order.shipping}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100 text-base font-bold">
              <span>Total</span>
              <span className="text-[#01AC28]">Rs. {order.total}</span>
            </div>
          </div>
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
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unit Price</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Qty</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                          <Image src={item.image_url} alt={item.item_name} fill className="object-contain p-1" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-[#374151]">{item.item_name}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.item_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.tier_label}</td>
                  <td className="px-6 py-4 text-sm font-medium">Rs. {item.unit_price}</td>
                  <td className="px-6 py-4 text-sm font-medium">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-[#01AC28]">Rs. {item.line_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {order.notes && (
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Order notes</p>
          <p className="text-sm text-amber-900">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
