import type {
  Order,
  OrderItem,
  OrderStatus,
  PaginatedOrders,
  CreateOrderRequest,
} from "@/types/order";

/** Item payload for create order (id assigned by server/mock). */
export type CreateOrderItemPayload = Omit<OrderItem, "id"> & { id?: number };

function buildAddress(o: {
  delivery_phone: string;
  delivery_address: string;
  delivery_city?: string | null;
}) {
  const parts = o.delivery_address.split(",").map((p) => p.trim());
  return {
    phone: o.delivery_phone,
    house_apt: parts[0] ?? "",
    street: parts[1] ?? "",
    block_locality: parts[2] ?? "",
    city: o.delivery_city ?? parts[3] ?? "",
  };
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    order_number: "ORD-00001",
    status: "delivered",
    payment_method: "cod",
    customer_id: 1,
    customer_name: "Ahmed Khan",
    customer_email: "ahmed@example.com",
    customer_phone: "+92 300 1234567",
    delivery_name: "Ahmed Khan",
    delivery_phone: "+92 300 1234567",
    delivery_address: "House 12 Apt 4B, Street 7, F-7 Markaz",
    delivery_city: "Islamabad",
    address: {
      phone: "+92 300 1234567",
      house_apt: "House 12, Apt 4B",
      street: "Street 7",
      block_locality: "F-7 Markaz",
      city: "Islamabad",
    },
    subtotal: "648.00",
    tax: "0.00",
    shipping: "0.00",
    total: "648.00",
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
    order_number: "ORD-00002",
    status: "processing",
    payment_method: "cod",
    customer_id: 2,
    customer_name: "Sara Ali",
    customer_email: "sara@example.com",
    customer_phone: "+92 321 9876543",
    delivery_name: "Sara Ali",
    delivery_phone: "+92 321 9876543",
    delivery_address: "Plot 45, Main Boulevard, DHA Phase 2",
    delivery_city: "Rawalpindi",
    address: {
      phone: "+92 321 9876543",
      house_apt: "Plot 45",
      street: "Main Boulevard",
      block_locality: "DHA Phase 2",
      city: "Rawalpindi",
    },
    subtotal: "555.00",
    tax: "0.00",
    shipping: "15.00",
    total: "570.00",
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
    order_number: "ORD-00003",
    status: "out_for_delivery",
    payment_method: "cod",
    customer_name: "Fatima Noor",
    customer_email: null,
    customer_phone: "+92 333 1112233",
    delivery_name: "Fatima Noor",
    delivery_phone: "+92 333 1112233",
    delivery_address: "Shop 3, Mall Road, Saddar",
    delivery_city: "Rawalpindi",
    address: {
      phone: "+92 333 1112233",
      house_apt: "Shop 3",
      street: "Mall Road",
      block_locality: "Saddar",
      city: "Rawalpindi",
    },
    subtotal: "2100.00",
    tax: "0.00",
    shipping: "0.00",
    total: "2100.00",
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
    order_number: "ORD-00004",
    status: "pending",
    payment_method: "cod",
    customer_id: 3,
    customer_name: "Imran Shah",
    customer_email: "imran@example.com",
    customer_phone: "+92 345 5556677",
    delivery_name: "Imran Shah",
    delivery_phone: "+92 345 5556677",
    delivery_address: "Block A Unit 8, Street 2, I-8/4",
    delivery_city: "Islamabad",
    address: {
      phone: "+92 345 5556677",
      house_apt: "Block A, Unit 8",
      street: "Street 2",
      block_locality: "I-8/4",
      city: "Islamabad",
    },
    subtotal: "297.00",
    tax: "0.00",
    shipping: "15.00",
    total: "312.00",
    notes: null,
    items: [
      {
        id: 5,
        product_id: 1,
        item_name: "MedRelief Pain Killer",
        item_id: "MED-001",
        tier: "item",
        tier_label: "Tablet",
        unit_price: "99.00",
        quantity: 3,
        line_total: "297.00",
        image_url: "/assets/home/product-250mg.png",
      },
    ],
    created_at: "2025-03-07T11:00:00Z",
    updated_at: "2025-03-07T11:00:00Z",
  },
  {
    id: 5,
    order_number: "ORD-00005",
    status: "cancelled",
    payment_method: "cod",
    customer_name: "Bilal Hussain",
    customer_email: null,
    customer_phone: "+92 311 4455667",
    delivery_name: "Bilal Hussain",
    delivery_phone: "+92 311 4455667",
    delivery_address: "House 7, Street 1, G-9",
    delivery_city: "Islamabad",
    address: {
      phone: "+92 311 4455667",
      house_apt: "House 7",
      street: "Street 1",
      block_locality: "G-9",
      city: "Islamabad",
    },
    subtotal: "99.00",
    tax: "0.00",
    shipping: "0.00",
    total: "99.00",
    notes: null,
    items: [
      {
        id: 6,
        product_id: 1,
        item_name: "MedRelief Pain Killer",
        item_id: "MED-001",
        tier: "item",
        tier_label: "Tablet",
        unit_price: "99.00",
        quantity: 1,
        line_total: "99.00",
        image_url: "/assets/home/product-250mg.png",
      },
    ],
    created_at: "2025-02-10T11:00:00Z",
    updated_at: "2025-02-10T12:30:00Z",
  },
];

let nextMockId = 100;

export function generateMockOrderNumber(): string {
  const n = nextMockId;
  return `ORD-${String(n).padStart(5, "0")}`;
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

/** Get a single mock order by id or order_number. */
export function getMockOrder(id: number | string): Order | null {
  if (typeof id === "string" && id.startsWith("ORD-")) {
    return MOCK_ORDERS.find((o) => o.order_number === id) ?? null;
  }
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (!Number.isFinite(numId)) return null;
  return MOCK_ORDERS.find((o) => o.id === numId) ?? null;
}

/** Track a mock order by order number + phone (guest flow). */
export function trackMockOrder(
  orderNumber: string,
  phone: string
): Order | null {
  return (
    MOCK_ORDERS.find(
      (o) =>
        o.order_number === orderNumber &&
        o.delivery_phone.replace(/\s/g, "") === phone.replace(/\s/g, "")
    ) ?? null
  );
}

/** Hint object passed from checkout so mock can produce realistic prices. */
export interface CartHint {
  name: string;
  price: number;
  image: string;
  variation?: string;
}

/** Create a mock order from the new API payload shape. */
export function createMockOrder(
  payload: CreateOrderRequest,
  cartHints?: Record<number, CartHint>
): Order {
  const id = nextMockId++;
  const orderNumber = generateMockOrderNumber();
  const now = new Date().toISOString();

  const items: OrderItem[] = payload.items.map((item, idx) => {
    const hint = cartHints?.[item.product_id];
    const unitPrice = hint?.price ?? 0;
    const lineTotal = unitPrice * item.quantity;
    return {
      id: id * 100 + idx,
      product_id: item.product_id,
      item_name: hint?.name || `Product #${item.product_id}`,
      item_id: `PROD-${item.product_id}`,
      tier: item.unit_type,
      tier_label:
        item.unit_type === "box"
          ? "Box"
          : item.unit_type === "secondary"
            ? "Pack"
            : "Unit",
      unit_price: unitPrice.toFixed(2),
      quantity: item.quantity,
      line_total: lineTotal.toFixed(2),
      image_url: hint?.image || null,
    };
  });

  const subtotal = items.reduce(
    (sum, i) => sum + parseFloat(i.line_total),
    0
  );
  const shipping = subtotal >= 199 ? 0 : 15;
  const total = subtotal + shipping;

  const addr = buildAddress(payload);

  const order: Order = {
    id,
    order_number: orderNumber,
    status: "pending",
    payment_method: "cod",
    customer_name: payload.delivery_name,
    customer_phone: payload.delivery_phone,
    delivery_name: payload.delivery_name,
    delivery_phone: payload.delivery_phone,
    delivery_address: payload.delivery_address,
    delivery_city: payload.delivery_city ?? null,
    delivery_gender: payload.delivery_gender ?? null,
    delivery_latitude: payload.delivery_latitude ?? null,
    delivery_longitude: payload.delivery_longitude ?? null,
    address: addr,
    subtotal: subtotal.toFixed(2),
    tax: "0.00",
    shipping: shipping.toFixed(2),
    total: total.toFixed(2),
    notes: payload.notes ?? null,
    items,
    created_at: now,
    updated_at: now,
  };
  MOCK_ORDERS.push(order);
  return order;
}

/** Create a mock order from the legacy payload shape (old checkout compat). */
export function createMockOrderLegacy(payload: {
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
    delivery_name: payload.customer_name,
    delivery_phone: payload.customer_phone,
    delivery_address: `${payload.address?.house_apt}, ${payload.address?.street}, ${payload.address?.block_locality}`,
    delivery_city: payload.address?.city,
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
  status: OrderStatus
): Order | null {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (!Number.isFinite(numId)) return null;
  const order = MOCK_ORDERS.find((o) => o.id === numId);
  if (!order) return null;
  order.status = status;
  order.updated_at = new Date().toISOString();
  return order;
}
