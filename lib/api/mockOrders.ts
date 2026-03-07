import type { Order, OrderItem, PaginatedOrders } from "@/types/order";

/** Item payload for create order (id assigned by server/mock). */
export type CreateOrderItemPayload = Omit<OrderItem, "id"> & { id?: number };

/** Mock orders for when backend is unavailable. Remove when API is ready. */
export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    order_number: "ORD-7721",
    status: "delivered",
    payment_method: "cod",
    customer_name: "Ahmed Khan",
    customer_email: "ahmed@example.com",
    customer_phone: "+92 300 1234567",
    address: {
      phone: "+92 300 1234567",
      house_apt: "House 12, Apt 4B",
      street: "Street 7",
      block_locality: "F-7 Markaz",
      city: "Islamabad",
    },
    subtotal: "1250.00",
    tax: "187.50",
    shipping: "0.00",
    total: "1437.50",
    notes: null,
    items: [
      {
        id: 1,
        product_id: 1,
        item_name: "MedRelief Pain Killer",
        item_id: "MED-001",
        tier: "item",
        tier_label: "Tablet",
        unit_price: "99.00",
        quantity: 2,
        line_total: "198.00",
        image_url: "/assets/home/product-250mg.png",
      },
      {
        id: 2,
        product_id: 2,
        item_name: "Vitamin C 1000mg",
        item_id: "VIT-002",
        tier: "box",
        tier_label: "Box",
        unit_price: "450.00",
        quantity: 1,
        line_total: "450.00",
        image_url: "/assets/home/product-3.png",
      },
    ],
    created_at: "2025-02-15T10:30:00Z",
    updated_at: "2025-02-18T14:00:00Z",
  },
  {
    id: 2,
    order_number: "ORD-7690",
    status: "confirmed",
    payment_method: "card",
    customer_name: "Sara Ali",
    customer_email: "sara@example.com",
    customer_phone: "+92 321 9876543",
    address: {
      phone: "+92 321 9876543",
      house_apt: "Plot 45",
      street: "Main Boulevard",
      block_locality: "DHA Phase 2",
      city: "Rawalpindi",
    },
    subtotal: "890.00",
    tax: "133.50",
    shipping: "15.00",
    total: "1038.50",
    notes: "Please call before delivery.",
    items: [
      {
        id: 3,
        product_id: 3,
        item_name: "Zinc Picolinate 50mg",
        item_id: "ZIN-003",
        tier: "item",
        tier_label: "Tablet",
        unit_price: "18.50",
        quantity: 30,
        line_total: "555.00",
        image_url: "/assets/home/product-4.png",
      },
    ],
    created_at: "2025-03-01T09:15:00Z",
    updated_at: "2025-03-01T09:15:00Z",
  },
  {
    id: 3,
    order_number: "ORD-7512",
    status: "pending",
    payment_method: "cod",
    customer_name: "Guest User",
    customer_email: null,
    customer_phone: "+92 333 1112233",
    address: {
      phone: "+92 333 1112233",
      house_apt: "Shop 3",
      street: "Mall Road",
      block_locality: "Saddar",
      city: "Rawalpindi",
    },
    subtotal: "2100.00",
    tax: "315.00",
    shipping: "0.00",
    total: "2415.00",
    notes: null,
    items: [
      {
        id: 4,
        product_id: 4,
        item_name: "Omega-3 Fish Oil",
        item_id: "OMG-004",
        tier: "box",
        tier_label: "Box",
        unit_price: "1050.00",
        quantity: 2,
        line_total: "2100.00",
        image_url: "/assets/home/product-5.png",
      },
    ],
    created_at: "2025-03-06T16:45:00Z",
    updated_at: "2025-03-06T16:45:00Z",
  },
  {
    id: 4,
    order_number: "ORD-7405",
    status: "cancelled",
    payment_method: "cod",
    customer_name: "Imran Shah",
    customer_email: "imran@example.com",
    customer_phone: "+92 345 5556677",
    address: {
      phone: "+92 345 5556677",
      house_apt: "Block A, Unit 8",
      street: "Street 2",
      block_locality: "I-8/4",
      city: "Islamabad",
    },
    subtotal: "320.00",
    tax: "48.00",
    shipping: "15.00",
    total: "383.00",
    notes: null,
    items: [],
    created_at: "2025-02-10T11:00:00Z",
    updated_at: "2025-02-10T12:30:00Z",
  },
];

let nextMockId = 10;

/** Generate a new order number for mock create. */
export function generateMockOrderNumber(): string {
  const n = 7700 + Math.floor(Math.random() * 300);
  return `ORD-${n}`;
}

/** Get paginated mock orders with optional status filter and search. */
export function getMockOrders(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  q?: string;
}): PaginatedOrders {
  const page = Math.max(1, params?.page ?? 1);
  const perPage = Math.min(100, Math.max(1, params?.per_page ?? 15));
  let list = [...MOCK_ORDERS];

  if (params?.status && params.status !== "all") {
    list = list.filter((o) => o.status === params.status);
  }
  if (params?.q?.trim()) {
    const q = params.q.trim().toLowerCase();
    list = list.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
    );
  }

  const total = list.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? null : (page - 1) * perPage + 1;
  const to = total === 0 ? null : Math.min(page * perPage, total);
  const data = list.slice((page - 1) * perPage, page * perPage);

  return {
    data,
    total,
    per_page: perPage,
    current_page: page,
    last_page: lastPage,
    from,
    to,
  };
}

/** Get a single mock order by id. */
export function getMockOrder(id: number | string): Order | null {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (!Number.isFinite(numId)) return null;
  return MOCK_ORDERS.find((o) => o.id === numId) ?? null;
}

/** Create a mock order (adds to in-memory list for session). Not persisted. */
export function createMockOrder(payload: {
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  address: Order["address"];
  payment_method: Order["payment_method"];
  items: CreateOrderItemPayload[];
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  notes?: string | null;
}): Order {
  const id = nextMockId++;
  const orderNumber = generateMockOrderNumber();
  const now = new Date().toISOString();
  const order: Order = {
    id,
    order_number: orderNumber,
    status: "pending",
    payment_method: payload.payment_method,
    customer_name: payload.customer_name,
    customer_email: payload.customer_email ?? null,
    customer_phone: payload.customer_phone,
    address: payload.address,
    subtotal: payload.subtotal,
    tax: payload.tax,
    shipping: payload.shipping,
    total: payload.total,
    notes: payload.notes ?? null,
    items: payload.items.map((item, idx) => ({
      ...item,
      id: id * 100 + idx,
    })),
    created_at: now,
    updated_at: now,
  };
  MOCK_ORDERS.push(order);
  return order;
}

/** Update mock order status (for dashboard fallback). */
export function updateMockOrderStatus(
  id: number | string,
  status: Order["status"]
): Order | null {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (!Number.isFinite(numId)) return null;
  const order = MOCK_ORDERS.find((o) => o.id === numId);
  if (!order) return null;
  order.status = status;
  order.updated_at = new Date().toISOString();
  return order;
}
