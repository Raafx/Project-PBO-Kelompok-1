export type ApiProduct = {
  id: string;
  barcode: string;
  sku: string | null;
  name: string;
  category: string;
  brand: string | null;
  unit: string;
  unit_conversion: number;
  location: string;
  image_url: string | null;
  price: number;
  stock: number;
};

export type MasterProduct = ApiProduct & {
  cost_price: number;
  warehouse_stock: number;
  reorder_level: number;
  is_active: boolean;
};

export type ProductPayload = {
  barcode: string;
  sku?: string;
  name: string;
  category: string;
  brand?: string;
  unit?: string;
  unit_conversion?: number;
  location: string;
  image_url?: string;
  price: number;
  cost_price: number;
  reorder_level: number;
  is_active: boolean;
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
    method:
      | "cash"
      | "qris"
      | "edc"
      | "debit"
      | "credit"
      | "wallet"
      | "voucher";
    received_amount?: number;
    approval_code?: string;
    card_type?: "debit" | "credit";
    card_number?: string;
    voucher_code?: string;
    confirmed?: boolean;
  };
};

export type CheckoutResponse = {
  id: string;
  transaction_no: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: {
    change_amount: number | null;
  } | null;
};

export type PosConfig = {
  store_name: string;
  store_address: string | null;
  logo_url: string | null;
  payment_methods: Array<CheckoutRequest["payment"]["method"]>;
  tax_rate: number;
  tax_included: boolean;
  receipt_paper: string;
  receipt_footer: string;
};

export type SaleDetail = CheckoutResponse & {
  status: "completed" | "held" | "cancelled";
  subtotal: number;
  discount: number;
  item_count: number;
  notes: string | null;
  created_at: string;
  items: Array<{
    id: string;
    barcode: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    discount: number;
    subtotal: number;
  }>;
};

export type CashMovement = {
  id: string;
  movement_type: "cash_in" | "cash_out";
  category: string;
  amount: number;
  note: string | null;
  created_at: string;
};

export type ShiftSummary = {
  id: string;
  store_code: string;
  cashier_code: string;
  cashier_name: string;
  opened_at: string;
  closed_at: string | null;
  opening_cash: number;
  cash_sales: number;
  cash_in: number;
  cash_out: number;
  expected_cash: number;
  closing_cash: number | null;
  difference: number | null;
  status: "open" | "closed";
  movements: CashMovement[];
};

export type CatalogOption = {
  id: string;
  kind: "category" | "unit" | "brand";
  code: string;
  name: string;
  conversion_factor: number;
  is_active: boolean;
};

export type Promotion = {
  id: string;
  code: string;
  name: string;
  promotion_type: "percent" | "fixed" | "buy_x_get_y" | "wholesale";
  product_id: string | null;
  value: number;
  min_quantity: number;
  buy_quantity: number | null;
  free_quantity: number | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

export type ProductBatch = {
  id: string;
  product_id: string;
  product_name: string;
  barcode: string;
  batch_no: string;
  expiry_date: string;
  quantity: number;
  days_until_expiry: number;
  status: "safe" | "warning" | "expired";
};

export type AdminMember = ApiMember & {
  is_active: boolean;
  created_at: string;
};

export type FinanceEntry = {
  id: string;
  entry_type:
    | "expense"
    | "deposit"
    | "reconciliation"
    | "receivable"
    | "payable"
    | "purchase_return";
  reference_no: string;
  counterparty: string | null;
  amount: number;
  status: "open" | "paid" | "settled" | "cancelled";
  due_date: string | null;
  payment_method: string | null;
  note: string | null;
  created_at: string;
};

export type BusinessSetting = {
  key: string;
  group_name: string;
  label: string;
  value: string;
};
export type AuditEntry = {
  id: string;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export type OperationsSnapshot = {
  stores: Array<{
    id: string;
    code: string;
    name: string;
    address: string | null;
    timezone: string;
    logo_url: string | null;
    tax_id: string | null;
  }>;
  catalog_options: CatalogOption[];
  promotions: Promotion[];
  batches: ProductBatch[];
  stock_counts: Array<{
    id: string;
    product_id: string;
    stock_area: string;
    system_quantity: number;
    physical_quantity: number;
    difference: number;
    note: string | null;
    created_at: string;
  }>;
  members: AdminMember[];
  finance_entries: FinanceEntry[];
  settings: BusinessSetting[];
  shifts: ShiftSummary[];
  returns: Array<{
    id: string;
    return_no: string;
    sale_id: string;
    amount: number;
    reason: string;
    created_at: string;
  }>;
  audit_logs: AuditEntry[];
};

export type OperationsReport = {
  period: string;
  revenue: number;
  gross_profit: number;
  expenses: number;
  net_profit: number;
  inventory_value: number;
  tax_estimate: number;
  purchase_spend: number;
  open_payables: number;
  open_receivables: number;
  slow_moving: Array<{ name: string; stock: number; sold: number }>;
  cashiers: Array<{ name: string; transactions: number; revenue: number }>;
};

export type AccountProfile = AccessProfile & { email: string | null };

export type LoginResult = {
  status: "authenticated" | "totp_setup_required" | "totp_required";
  access_token: string | null;
  challenge_token: string | null;
  provisioning_uri: string | null;
  totp_secret: string | null;
  expires_at: string | null;
  employee_code: string;
  full_name: string;
  role_name: string;
  permissions: string[];
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
  sales_stock: number;
  warehouse_stock: number;
  total_stock: number;
  reorder_level: number;
  stock_status: "healthy" | "low" | "out";
};

export type StockMovement = {
  id: string;
  product_id: string;
  movement_type: "purchase" | "sale" | "adjustment" | "return" | "transfer";
  stock_area: "warehouse" | "sales";
  quantity_change: number;
  balance_after: number;
  reference_type: string | null;
  note: string | null;
  created_at: string;
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
  created_by_id: string | null;
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
  warehouse_stock_units: number;
  sales_stock_units: number;
  low_stock_count: number;
  active_supplier_count: number;
  open_purchase_order_count: number;
  purchase_spend_this_month: number;
  inventory_value: number;
  low_stock_products: StockItem[];
  recent_purchase_orders: PurchaseOrder[];
};

export type AccessProfile = {
  employee_code: string;
  full_name: string;
  role_code: string;
  role_name: string;
  permissions: string[];
};

export type AccessRole = {
  id: string;
  code: string;
  name: string;
  is_system: boolean;
  permissions: string[];
};

export type StaffMember = {
  id: string;
  employee_code: string;
  full_name: string;
  is_active: boolean;
  role_id: string | null;
  role_code: string | null;
  role_name: string | null;
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
  payment_method:
    | "cash"
    | "qris"
    | "edc"
    | "debit"
    | "credit"
    | "wallet"
    | "voucher"
    | null;
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
  daily_sales: Array<{
    date: string;
    total_sales: number;
    transaction_count: number;
  }>;
  payment_methods: Array<{ label: string; amount: number; count: number }>;
  category_sales: Array<{ label: string; amount: number; count: number }>;
  top_products: Array<{
    barcode: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  recent_sales: AdminSale[];
};

export type LiveTransactionStatus =
  | "ready"
  | "shopping"
  | "payment"
  | "processing"
  | "completed"
  | "held"
  | "cancelled";

export type LiveTransactionHeartbeat = {
  session_id: string;
  store_code: string;
  cashier_code: string;
  status: LiveTransactionStatus;
  items: Array<{ barcode: string; quantity: number }>;
  payment_method?: CheckoutRequest["payment"]["method"];
  payment_ready: boolean;
  member_phone?: string;
  current_action: string;
  transaction_no?: string;
};

export type LiveCartItem = {
  barcode: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  image_url: string | null;
};

export type LiveTransaction = {
  id: string;
  store_code: string;
  store_name: string;
  cashier_code: string;
  cashier_name: string;
  status: LiveTransactionStatus;
  progress: number;
  item_count: number;
  unique_products: number;
  subtotal: number;
  total: number;
  payment_method: CheckoutRequest["payment"]["method"] | null;
  payment_ready: boolean;
  member_name: string | null;
  current_action: string;
  transaction_no: string | null;
  started_at: string | null;
  completed_at: string | null;
  last_seen_at: string;
  online: boolean;
  service_ready: boolean;
  items: LiveCartItem[];
};

export type LiveWorkflowSnapshot = {
  generated_at: string;
  sessions: LiveTransaction[];
};

export type CeoChatStatus = {
  configured: boolean;
  model: string;
  project_name: string;
  project_number: string;
  context_source: string;
};

export type CeoChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type CeoChatConversation = {
  id: string;
  title: string;
  updated_at: string;
  messages: CeoChatMessage[];
};

export type CeoChatStreamEvent =
  | { type: "user_message"; message: CeoChatMessage; title: string }
  | { type: "delta"; text: string }
  | { type: "done"; message: CeoChatMessage; updated_at: string }
  | { type: "error"; message: string };

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(
  /\/$/,
  "",
);
const adminActorCode =
  process.env.NEXT_PUBLIC_ADMIN_ACTOR_CODE?.trim() || "KASIR03";
const allowDevActor =
  process.env.NEXT_PUBLIC_ALLOW_DEV_ACTOR?.trim().toLowerCase() === "true";

export const isApiConfigured =
  Boolean(configuredBaseUrl) && process.env.NODE_ENV !== "test";

function adminAuthorizationHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("mymarket_token")
      : null;
  if (token) return { Authorization: `Bearer ${token}` };
  return allowDevActor ? { "X-Actor-Code": adminActorCode } : {};
}

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
    const savedToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("mymarket_token")
        : null;
    const response = await fetch(`${configuredBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
        ...(path.startsWith("/admin") && !savedToken && allowDevActor
          ? { "X-Actor-Code": adminActorCode }
          : {}),
        ...init?.headers,
      },
    });
    if (!response.ok) {
      const problem = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;
      throw new Error(
        problem?.detail || `Permintaan gagal (${response.status})`,
      );
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  } catch (error) {
    if (timedOut)
      throw new Error(
        "Backend tidak merespons dalam 10 detik. Periksa layanan API lalu muat ulang.",
      );
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    sourceSignal?.removeEventListener("abort", relayAbort);
  }
}

export function loadProducts(signal?: AbortSignal) {
  return apiRequest<ApiProduct[]>("/products?limit=200", { signal });
}

export function loadPosConfig(signal?: AbortSignal) {
  return apiRequest<PosConfig>("/pos/config", { signal });
}

export function lookupMember(phone: string) {
  return apiRequest<ApiMember>(
    `/members/by-phone/${encodeURIComponent(phone)}`,
  );
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

export function saveHold(
  payload: Omit<CheckoutRequest, "payment"> & { notes?: string },
) {
  return apiRequest<SaleDetail>("/sales/hold", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function loadHolds() {
  return apiRequest<SaleDetail[]>("/sales/holds?limit=100");
}

export function deleteHold(id: string) {
  return apiRequest<void>(`/sales/holds/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function loadCashierSales(cashierCode: string) {
  return apiRequest<SaleDetail[]>(
    `/cashier/sales?cashier_code=${encodeURIComponent(cashierCode)}`,
  );
}

export function loadCurrentShift(
  cashierCode: string,
  storeCode = "MY-001",
) {
  return apiRequest<ShiftSummary | null>(
    `/shifts/current?store_code=${encodeURIComponent(storeCode)}&cashier_code=${encodeURIComponent(cashierCode)}`,
  );
}

export function openCashierShift(cashierCode: string, openingCash: number) {
  return apiRequest<ShiftSummary>("/shifts/open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store_code: "MY-001",
      cashier_code: cashierCode,
      opening_cash: openingCash,
    }),
  });
}

export function addShiftCashMovement(
  shiftId: string,
  cashierCode: string,
  payload: {
    movement_type: "cash_in" | "cash_out";
    category: string;
    amount: number;
    note?: string;
  },
) {
  return apiRequest<ShiftSummary>(
    `/shifts/${encodeURIComponent(shiftId)}/cash-movements`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, cashier_code: cashierCode }),
    },
  );
}

export function closeCashierShift(
  shiftId: string,
  cashierCode: string,
  closingCash: number,
) {
  return apiRequest<ShiftSummary>(
    `/shifts/${encodeURIComponent(shiftId)}/close`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cashier_code: cashierCode,
        closing_cash: closingCash,
      }),
    },
  );
}

export function voidSale(
  transactionNo: string,
  supervisorCode: string,
  supervisorPin: string,
  reason: string,
) {
  return apiRequest<{ return_no: string; amount: number }>(
    `/sales/${encodeURIComponent(transactionNo)}/void`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supervisor_code: supervisorCode,
        supervisor_pin: supervisorPin,
        reason,
      }),
    },
  );
}

export function updateLiveTransaction(payload: LiveTransactionHeartbeat) {
  return apiRequest<LiveTransaction>("/live-transactions/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function loadLiveTransactions() {
  return apiRequest<LiveWorkflowSnapshot>("/admin/live-transactions");
}

export async function streamLiveTransactions(
  onSnapshot: (snapshot: LiveWorkflowSnapshot) => void,
  signal?: AbortSignal,
) {
  if (!configuredBaseUrl) throw new Error("API backend belum dikonfigurasi");
  const response = await fetch(
    `${configuredBaseUrl}/admin/live-transactions/stream`,
    {
      signal,
      headers: {
        Accept: "application/x-ndjson",
        ...adminAuthorizationHeaders(),
      },
    },
  );
  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(problem?.detail || `Permintaan gagal (${response.status})`);
  }
  if (!response.body)
    throw new Error("Browser tidak mendukung streaming response");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.trim()) onSnapshot(JSON.parse(line) as LiveWorkflowSnapshot);
    }
    if (done) break;
  }
  if (buffer.trim()) onSnapshot(JSON.parse(buffer) as LiveWorkflowSnapshot);
}

export function loadAdminDashboard() {
  return apiRequest<AdminDashboard>("/admin/dashboard");
}

export function loadMasterProducts() {
  return apiRequest<MasterProduct[]>("/admin/products?active=true");
}

export function createMasterProduct(payload: ProductPayload) {
  return apiRequest<MasterProduct>("/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateMasterProduct(id: string, payload: ProductPayload) {
  return apiRequest<MasterProduct>(
    `/admin/products/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function archiveMasterProduct(id: string) {
  return apiRequest<MasterProduct>(
    `/admin/products/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

export function loadMyAccess() {
  return apiRequest<AccessProfile>("/admin/access/me");
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

export function loadStockMovements() {
  return apiRequest<StockMovement[]>("/admin/stock/movements?limit=100");
}

export function loadSuppliers() {
  return apiRequest<Supplier[]>("/admin/suppliers");
}

export function loadPurchaseOrders() {
  return apiRequest<PurchaseOrder[]>("/admin/purchases");
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

export function recordPurchase(
  payload: {
    supplier_id: string;
    store_code: string;
    purchase_date?: string;
    notes?: string;
    items: Array<{ barcode: string; quantity: number; unit_cost?: number }>;
  },
  idempotencyKey: string,
) {
  return apiRequest<PurchaseOrder>("/admin/purchases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
}

export function createStockAdjustment(payload: {
  product_id: string;
  quantity_change: number;
  area: "warehouse" | "sales";
  note: string;
}) {
  return apiRequest<{ id: string; balance_after: number }>(
    "/admin/stock/adjustments",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function createStockTransfer(payload: {
  product_id: string;
  quantity: number;
  from_area: "warehouse" | "sales";
  to_area: "warehouse" | "sales";
  note?: string;
}) {
  return apiRequest<{ id: string; transfer_no: string }>(
    "/admin/stock/transfers",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function loadRoles() {
  return apiRequest<AccessRole[]>("/admin/roles");
}

export function updateRole(
  id: string,
  payload: { name?: string; permissions: string[] },
) {
  return apiRequest<AccessRole>(`/admin/roles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function loadStaff() {
  return apiRequest<StaffMember[]>("/admin/staff");
}

export function assignStaffRole(staffId: string, roleId: string) {
  return apiRequest<StaffMember>(`/admin/staff/${staffId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role_id: roleId }),
  });
}

export function loadOperations() {
  return apiRequest<OperationsSnapshot>("/admin/operations");
}

export function loadOperationsReport() {
  return apiRequest<OperationsReport>("/admin/reports/operations");
}

export function createCatalogOption(payload: {
  kind: CatalogOption["kind"];
  code: string;
  name: string;
  conversion_factor?: number;
}) {
  return apiRequest<CatalogOption>("/admin/catalog-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function createPromotion(payload: Omit<Promotion, "id">) {
  return apiRequest<Promotion>("/admin/promotions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function createProductBatch(payload: {
  product_id: string;
  batch_no: string;
  expiry_date: string;
  quantity: number;
}) {
  return apiRequest<ProductBatch>("/admin/product-batches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, store_code: "MY-001" }),
  });
}

export function createStockCount(payload: {
  product_id: string;
  stock_area: "warehouse" | "sales";
  physical_quantity: number;
  note?: string;
}) {
  return apiRequest<OperationsSnapshot["stock_counts"][number]>(
    "/admin/stock-counts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, store_code: "MY-001" }),
    },
  );
}

export function createAdminMember(payload: {
  phone: string;
  full_name: string;
  tier?: string;
  points?: number;
}) {
  return apiRequest<AdminMember>("/admin/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateAdminMember(
  id: string,
  payload: Partial<
    Pick<AdminMember, "full_name" | "tier" | "points" | "is_active">
  >,
) {
  return apiRequest<AdminMember>(`/admin/members/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function createFinanceEntry(payload: {
  entry_type: FinanceEntry["entry_type"];
  counterparty?: string;
  amount: number;
  status?: FinanceEntry["status"];
  due_date?: string;
  payment_method?: CheckoutRequest["payment"]["method"];
  note?: string;
}) {
  return apiRequest<FinanceEntry>("/admin/finance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function settleFinanceEntry(id: string, status: FinanceEntry["status"]) {
  return apiRequest<FinanceEntry>(`/admin/finance/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export function createPurchaseOrder(payload: {
  supplier_id: string;
  expected_date?: string;
  notes?: string;
  items: Array<{ barcode: string; quantity: number; unit_cost?: number }>;
}) {
  return apiRequest<PurchaseOrder>("/admin/purchase-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, store_code: "MY-001" }),
  });
}

export function createAutomaticPurchaseOrder(supplierId: string) {
  return apiRequest<PurchaseOrder>("/admin/purchase-orders/auto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ supplier_id: supplierId, store_code: "MY-001" }),
  });
}

export function receivePurchaseOrder(order: PurchaseOrder) {
  return apiRequest<PurchaseOrder>(
    `/admin/purchase-orders/${encodeURIComponent(order.id)}/receive`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: order.items
          .filter((item) => item.quantity_received < item.quantity_ordered)
          .map((item) => ({
            item_id: item.id,
            quantity_received: item.quantity_ordered - item.quantity_received,
          })),
      }),
    },
  );
}

export function createPurchaseReturn(payload: {
  product_id: string;
  supplier_id: string;
  quantity: number;
  note: string;
}) {
  return apiRequest<FinanceEntry>("/admin/purchase-returns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, store_code: "MY-001" }),
  });
}

export function saveBusinessSetting(
  key: string,
  payload: { group_name: string; label: string; value: string },
) {
  return apiRequest<BusinessSetting>(
    `/admin/settings/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
}

export function saveStoreProfile(payload: {
  name: string;
  address?: string;
  logo_url?: string;
  tax_id?: string;
  timezone?: string;
}) {
  return apiRequest<{ code: string; name: string }>("/admin/store-profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function createStore(payload: {
  code: string;
  name: string;
  address?: string;
  timezone?: string;
}) {
  return apiRequest<{ id: string; code: string; name: string }>(
    "/admin/stores",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        timezone: payload.timezone || "Asia/Makassar",
      }),
    },
  );
}

export function createStaff(payload: {
  employee_code: string;
  full_name: string;
  email: string;
  password: string;
  pin: string;
  role_id: string;
}) {
  return apiRequest<StaffMember>("/admin/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function loginAccount(identity: string, password: string) {
  return apiRequest<LoginResult>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity, password }),
  });
}

export function confirmTotpSetup(challengeToken: string, code: string) {
  return apiRequest<LoginResult>("/auth/totp/setup/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge_token: challengeToken, code }),
  });
}

export function verifyTotpLogin(challengeToken: string, code: string) {
  return apiRequest<LoginResult>("/auth/totp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge_token: challengeToken, code }),
  });
}

export function logoutAccount() {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("mymarket_token")
      : null;
  if (!token) return Promise.resolve();
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string; reset_token: string | null }>(
    "/auth/forgot-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
  );
}

export function resetPassword(token: string, newPassword: string) {
  return apiRequest<void>("/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

export function loadAccountProfile() {
  return apiRequest<AccountProfile>("/auth/profile");
}

export function updateAccountProfile(fullName: string, email: string) {
  return apiRequest<AccountProfile>("/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, email }),
  });
}

export function changeAccountPin(currentPin: string, newPin: string) {
  return apiRequest<void>("/auth/change-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_pin: currentPin, new_pin: newPin }),
  });
}

export function exportProductsUrl() {
  return configuredBaseUrl
    ? `${configuredBaseUrl}/admin/products/export.xlsx`
    : "";
}

export function productBarcodeUrl(productId: string) {
  return configuredBaseUrl
    ? `${configuredBaseUrl}/products/${encodeURIComponent(productId)}/barcode.svg`
    : "";
}

export async function downloadAdminFile(path: string, filename: string) {
  if (!configuredBaseUrl) throw new Error("API backend belum dikonfigurasi");
  const response = await fetch(`${configuredBaseUrl}${path}`, {
    headers: adminAuthorizationHeaders(),
  });
  if (!response.ok) throw new Error(`Unduhan gagal (${response.status})`);
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importProducts(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<{ created: number; updated: number }>(
    "/admin/products/import.xlsx",
    { method: "POST", body: form },
  );
}

export function backupUrl() {
  return configuredBaseUrl ? `${configuredBaseUrl}/admin/backup` : "";
}

export function loadCeoChatStatus() {
  return apiRequest<CeoChatStatus>("/admin/ceo-chat/status");
}

export function loadCeoChatConversations() {
  return apiRequest<CeoChatConversation[]>("/admin/ceo-chat/conversations");
}

export function createCeoChatConversation(title = "Percakapan baru") {
  return apiRequest<CeoChatConversation>("/admin/ceo-chat/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export function deleteCeoChatConversation(id: string) {
  return apiRequest<void>(
    `/admin/ceo-chat/conversations/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}

export async function streamCeoChatMessage(
  conversationId: string,
  message: string,
  onEvent: (event: CeoChatStreamEvent) => void,
  signal?: AbortSignal,
) {
  if (!configuredBaseUrl) throw new Error("API backend belum dikonfigurasi");
  const controller = new AbortController();
  const relayAbort = () => controller.abort();
  let timedOut = false;
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", relayAbort, { once: true });
  const timeout = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 30_000);

  try {
    const response = await fetch(
      `${configuredBaseUrl}/admin/ceo-chat/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Accept: "application/x-ndjson",
          "Content-Type": "application/json",
          ...adminAuthorizationHeaders(),
        },
        body: JSON.stringify({ message }),
      },
    );
    if (!response.ok) {
      const problem = (await response.json().catch(() => null)) as {
        detail?: string;
      } | null;
      throw new Error(problem?.detail || `Permintaan gagal (${response.status})`);
    }
    if (!response.body)
      throw new Error("Browser tidak mendukung streaming response");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim()) onEvent(JSON.parse(line) as CeoChatStreamEvent);
      }
      if (done) break;
    }
    if (buffer.trim()) onEvent(JSON.parse(buffer) as CeoChatStreamEvent);
  } catch (error) {
    if (timedOut)
      throw new Error("Asisten belum merespons dalam 30 detik. Silakan coba lagi.");
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    signal?.removeEventListener("abort", relayAbort);
  }
}
