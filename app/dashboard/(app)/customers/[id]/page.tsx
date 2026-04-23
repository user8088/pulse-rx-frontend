import Link from "@/lib/navigation";
import { getCustomer, getCustomerOrders } from "@/lib/api/dashboardCustomers";
import { CustomerDetailTabs } from "./CustomerDetailTabs";
import { CustomerInfoTab } from "./CustomerInfoTab";
import { CustomerOrdersTab } from "./CustomerOrdersTab";
import { CustomerProfilesTab } from "./CustomerProfilesTab";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string; message?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const tab = (sp.tab ?? "info").toLowerCase();
  const message = sp.message;
  const error = sp.error;
  const ordersPage = Math.max(1, parseInt((sp as { page?: string }).page ?? "1", 10) || 1);

  const customer = await getCustomer(id);

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          Customer not found.
        </div>
        <Link
          href="/dashboard/customers"
          className="text-sm font-semibold text-[#01AC28] hover:underline"
        >
          ← Back to Customers
        </Link>
      </div>
    );
  }

  const validTab =
    tab === "info" || tab === "discount" || tab === "orders" || tab === "profiles"
      ? tab
      : "info";

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/customers"
            className="text-sm font-semibold text-gray-500 hover:text-[#01AC28] transition-colors"
          >
            ← Customers
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#374151]">{customer.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {customer.phone || customer.email || "No contact"}
            </p>
          </div>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            error
              ? "border-red-100 bg-red-50 text-red-700"
              : "border-green-100 bg-green-50 text-green-700"
          }`}
        >
          {message || error}
        </div>
      )}

      <CustomerDetailTabs customerId={id} currentTab={validTab} />

      {validTab === "info" && <CustomerInfoTab customer={customer} />}

      {validTab === "discount" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
            Customer discount
          </div>
          <p className="mt-2 text-2xl font-bold text-[#374151]">
            {customer.discount_percentage != null && customer.discount_percentage > 0
              ? `${customer.discount_percentage}%`
              : "0%"}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            This percentage is applied to all products for this customer. Edit in the Info tab.
          </p>
          <Link
            href={`/dashboard/customers/${id}?tab=info`}
            className="mt-4 inline-block text-sm font-semibold text-[#01AC28] hover:underline"
          >
            Edit customer info →
          </Link>
        </div>
      )}

      {validTab === "orders" && (
        <CustomerOrdersTab customerId={id} page={ordersPage} />
      )}

      {validTab === "profiles" && <CustomerProfilesTab customerId={id} />}
    </div>
  );
}
