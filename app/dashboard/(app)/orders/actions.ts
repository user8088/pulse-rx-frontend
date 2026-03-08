"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateOrderStatus as updateOrderStatusApi } from "@/lib/api/dashboardOrders";
import type { OrderStatus } from "@/types/order";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export async function updateOrderStatusAction(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");

  if (!id || typeof id !== "string" || !status || typeof status !== "string") {
    return redirect("/dashboard/orders?error=missing&message=Order ID and status are required.");
  }

  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    return redirect("/dashboard/orders?error=invalid&message=Invalid status.");
  }

  const order = await updateOrderStatusApi(id, status as OrderStatus);
  if (!order) {
    return redirect(`/dashboard/orders?error=failed&message=Failed to update order status.`);
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${id}`);
  return redirect(`/dashboard/orders/${id}?message=Status updated to ${status.replace(/_/g, " ")}.`);
}
