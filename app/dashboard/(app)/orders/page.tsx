import Link from "@/lib/navigation";
import { getDashboardOrders } from "@/lib/api/dashboardOrders";
import type { Order } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { OrdersToolbar } from "./OrdersToolbar";

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

export default async function DashboardOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    status?: string;
    q?: string;
    message?: string;
    error?: string;
  }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const status = (sp.status ?? "all").trim() || "all";
  const q = (sp.q ?? "").trim();
  const message = sp.message;
  const error = sp.error;

  const data = await getDashboardOrders({
    page,
    per_page: 50,
    status: status === "all" ? undefined : status,
    q: q || undefined,
  });

  const orders = data.data ?? [];
  const total = data.total ?? 0;
  const currentPage = data.current_page ?? 1;
  const lastPage = data.last_page ?? 1;
  const from = data.from;
  const to = data.to;

  const paginationParams: Record<string, string> = {};
  if (status !== "all") paginationParams.status = status;
  if (q) paginationParams.q = q;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#374151]">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and view all orders</p>
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <OrdersToolbar query={q} status={status} total={total} showing={orders.length} />

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order #</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden lg:table-cell">Address</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-[#374151]">{order.order_number}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {order.delivery_name || order.customer_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      {order.delivery_phone || order.customer_phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell max-w-[260px]">
                      <p className="truncate">
                        {order.delivery_address || "—"}
                        {order.delivery_city ? `, ${order.delivery_city}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#374151]">Rs. {order.total}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-xs font-bold text-[#01AC28] hover:underline uppercase tracking-wider"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              basePath="/dashboard/orders"
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              from={from}
              to={to}
              params={paginationParams}
            />
          </div>
        )}
      </div>
    </div>
  );
}
