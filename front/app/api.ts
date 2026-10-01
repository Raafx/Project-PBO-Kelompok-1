export type ApiProduct = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  location: string;
  price: number;
};

export type ApiMember = {
  id: string;
  phone: string;
  full_name: string;
  tier: string;
  points: number;
};

export type CheckoutRequest = {
  store_code: string;
  cashier_code: string;
  member_phone?: string;
  items: Array<{ barcode: string; quantity: number }>;
  payment: {
    method: "cash" | "qris" | "debit" | "credit" | "wallet" | "voucher";
    received_amount?: number;
    approval_code?: string;
    voucher_code?: string;
    confirmed?: boolean;
  };
};

export type CheckoutResponse = {
  id: string;
  transaction_no: string;
  total: number;
  payment: {
    change_amount: number | null;
  } | null;
};

export type StockItem = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  location: string;
  price: number;
  cost_price: number;
  stock: number;
  reorder_level: number;
  stock_status: "healthy" | "low" | "out";
};

export type Supplier = {
  id: string;
  code: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
};

export type PurchaseOrderItem = {
  id: string;
  product_id: string;
  barcode: string;
  product_name: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  subtotal: number;
};

export type PurchaseOrder = {
  id: string;
  po_number: string;
  status: "draft" | "ordered" | "partially_received" | "received" | "cancelled";
  expected_date: string | null;
  subtotal: number;
  notes: string | null;
  ordered_at: string | null;
  received_at: string | null;
  created_at: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
};

export type AdminDashboard = {
  product_count: number;
  stock_units: number;
  low_stock_count: number;
  active_supplier_count: number;
  open_purchase_order_count: number;
  purchase_spend_this_month: number;
  inventory_value: number;
  low_stock_products: StockItem[];
  recent_purchase_orders: PurchaseOrder[];
};

export type AdminSale = {
  id: string;
  transaction_no: string;
  status: "completed" | "held" | "cancelled";
  total: number;
  discount: number;
  item_count: number;
  created_at: string;
  cashier_name: string;
  member_name: string | null;
  payment_method: "cash" | "qris" | "debit" | "credit" | "wallet" | "voucher" | null;
};

export type SalesReport = {
  date_from: string;
  date_to: string;
  total_sales: number;
  transaction_count: number;
  item_count: number;
  average_transaction: number;
  total_discount: number;
  estimated_gross_profit: number;
  daily_sales: Array<{ date: string; total_sales: number; transaction_count: number }>;
  payment_methods: Array<{ label: string; amount: number; count: number }>;
  category_sales: Array<{ label: string; amount: number; count: number }>;
  top_products: Array<{ barcode: string; name: string; quantity: number; revenue: number }>;
  recent_sales: AdminSale[];
};

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");

export const isApiConfigured = Boolean(configuredBaseUrl) && process.env.NODE_ENV !== "test";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!configuredBaseUrl) throw new Error("API backend belum dikonfigurasi");
  const controller = new AbortController();
  const sourceSignal = init?.signal;
  let timedOut = false;
  const relayAbort = () => controller.abort();
  if (sourceSignal?.aborted) controller.abort();
  sourceSignal?.addEventListener("abort", relayAbort, { once: true });
  const timeout = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 10_000);

  try {
    const response = await fetch(`${configuredBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
    if (!response.ok) {
      const problem = (await response.json().catch(() => null)) as { detail?: string } | null;
      throw new Error(problem?.detail || `Permintaan gagal (${response.status})`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    if (timedOut) throw new Error("Backend tidak merespons dalam 10 detik. Periksa layanan API lalu muat ulang.");
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    sourceSignal?.removeEventListener("abort", relayAbort);
  }
}

export function loadProducts(signal?: AbortSignal) {
  return apiRequest<ApiProduct[]>("/products?limit=200", { signal });
}

export function lookupMember(phone: string) {
  return apiRequest<ApiMember>(`/members/by-phone/${encodeURIComponent(phone)}`);
}

export function validateVoucher(code: string, total: number) {
  return apiRequest<{ valid: boolean; message: string }>("/vouchers/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, total }),
  });
}

export function saveCheckout(payload: CheckoutRequest, idempotencyKey: string) {
  return apiRequest<CheckoutResponse>("/sales/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
}

export function loadAdminDashboard() {
  return apiRequest<AdminDashboard>("/admin/dashboard");
}

export function loadAdminSales() {
  return apiRequest<AdminSale[]>("/admin/sales?limit=300");
}

export function loadSalesReport(dateFrom?: string, dateTo?: string) {
  const params = new URLSearchParams();
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  const query = params.size ? `?${params.toString()}` : "";
  return apiRequest<SalesReport>(`/admin/reports/sales${query}`);
}

export function loadAdminStock() {
  return apiRequest<StockItem[]>("/admin/stock");
}

export function loadSuppliers() {
  return apiRequest<Supplier[]>("/admin/suppliers");
}

export function loadPurchaseOrders() {
  return apiRequest<PurchaseOrder[]>("/admin/purchase-orders");
}

export function createSupplier(payload: {
  code: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  return apiRequest<Supplier>("/admin/suppliers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function createPurchaseOrder(payload: {
  supplier_id: string;
  store_code: string;
  expected_date?: string;
  notes?: string;
  items: Array<{ barcode: string; quantity: number; unit_cost?: number }>;
}) {
  return apiRequest<PurchaseOrder>("/admin/purchase-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function submitPurchaseOrder(id: string) {
  return apiRequest<PurchaseOrder>(`/admin/purchase-orders/${id}/submit`, {
    method: "POST",
  });
}

export function receivePurchaseOrder(id: string, items?: Array<{ item_id: string; quantity: number }>) {
  return apiRequest<PurchaseOrder>(`/admin/purchase-orders/${id}/receive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items?.length ? { items } : {}),
  });
}

export function createStockAdjustment(payload: {
  product_id: string;
  quantity_change: number;
  note: string;
}) {
  return apiRequest<{ id: string; balance_after: number }>("/admin/stock/adjustments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

