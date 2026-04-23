import Link from "@/lib/navigation";
import { getCustomerOrders } from "@/lib/api/dashboardCustomers";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import type { Order } from "@/types/order";

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

export async function CustomerOrdersTab({
  customerId,
  page,
}: {
  customerId: number | string;
  page: number;
}) {
  const data = await getCustomerOrders(customerId, { page, per_page: 10 });
  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? null;
  const to = data?.to ?? null;

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 text-center text-sm text-gray-600">
          No orders for this customer yet.
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Total
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-[#374151]">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        Rs. {order.total}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANTS[order.status]}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-xs font-bold text-[#01AC28] hover:underline uppercase tracking-wider"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {lastPage > 1 && (
            <Pagination
              basePath={`/dashboard/customers/${customerId}`}
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              from={from}
              to={to}
              params={{ tab: "orders" }}
            />
          )}
        </>
      )}
    </div>
  );
}
