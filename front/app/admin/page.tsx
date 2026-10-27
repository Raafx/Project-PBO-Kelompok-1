"use client";

import { Icon } from "@iconify/react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  FormEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  InputGroup,
  Modal,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import AdmintoShell from "./AdmintoShell";
import OperationsCenter, { type OperationsTab } from "./OperationsCenter";

import {
  assignStaffRole,
  archiveMasterProduct,
  createMasterProduct,
  createStockAdjustment,
  createStockTransfer,
  createSupplier,
  isApiConfigured,
  loadAdminDashboard,
  loadAdminSales,
  loadAdminStock,
  loadMyAccess,
  loadMasterProducts,
  loadLiveTransactions,
  loadPurchaseOrders,
  loadRoles,
  loadSalesReport,
  loadStaff,
  loadSuppliers,
  recordPurchase,
  updateRole,
  updateMasterProduct,
  streamLiveTransactions,
  type AccessProfile,
  type AccessRole,
  type AdminDashboard,
  type AdminSale,
  type MasterProduct,
  type LiveTransaction,
  type LiveWorkflowSnapshot,
  type ProductPayload,
  type PurchaseOrder,
  type SalesReport,
  type StockItem,
  type StaffMember,
  type Supplier,
} from "../api";
import SearchableSelect from "../SearchableSelect";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type AdminView =
  | "overview"
  | "live"
  | "cashier"
  | "products"
  | "sales"
  | "reports"
  | "stock"
  | "purchasing"
  | "customers"
  | "finance"
  | "settings"
  | "access";
type ModalName =
  "product" | "purchase" | "supplier" | "adjustment" | "transfer" | null;
type PurchaseLine = {
  key: string;
  barcode: string;
  quantity: number;
  unitCost: number;
};
type ProductFormState = ProductPayload;

const moneyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("id-ID");
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const navigation: Array<{
  id: AdminView;
  label: string;
  icon: string;
  permission: string;
}> = [
  {
    id: "overview",
    label: "Ringkasan",
    icon: "solar:widget-5-bold-duotone",
    permission: "admin.overview",
  },
  {
    id: "live",
    label: "Transaksi Live",
    icon: "solar:monitor-camera-bold-duotone",
    permission: "admin.live_transactions",
  },
  {
    id: "cashier",
    label: "Kasir & Shift",
    icon: "solar:calculator-bold-duotone",
    permission: "admin.operations",
  },
  {
    id: "products",
    label: "Produk & Promo",
    icon: "solar:tag-price-bold-duotone",
    permission: "admin.products",
  },
  {
    id: "sales",
    label: "Penjualan",
    icon: "solar:bill-list-bold-duotone",
    permission: "admin.sales",
  },
  {
    id: "stock",
    label: "Kontrol Stok",
    icon: "solar:box-bold-duotone",
    permission: "admin.stock",
  },
  {
    id: "purchasing",
    label: "PO & Supplier",
    icon: "solar:cart-large-2-bold-duotone",
    permission: "admin.purchasing",
  },
  {
    id: "customers",
    label: "Pelanggan",
    icon: "solar:users-group-rounded-bold-duotone",
    permission: "admin.operations",
  },
  {
    id: "finance",
    label: "Keuangan",
    icon: "solar:wallet-money-bold-duotone",
    permission: "admin.finance",
  },
  {
    id: "reports",
    label: "Laporan Bisnis",
    icon: "solar:chart-2-bold-duotone",
    permission: "admin.reports",
  },
  {
    id: "settings",
    label: "Pengaturan",
    icon: "solar:settings-bold-duotone",
    permission: "admin.settings",
  },
  {
    id: "access",
    label: "Role & akses",
    icon: "solar:shield-user-bold-duotone",
    permission: "admin.roles",
  },
];

const operationsViewTabs: Partial<Record<AdminView, OperationsTab>> = {
  cashier: "cashier",
  products: "catalog",
  stock: "inventory",
  purchasing: "purchasing",
  customers: "customers",
  finance: "finance",
  reports: "reports",
  settings: "settings",
};

const permissionLabels: Record<string, string> = {
  "pos.access": "Kasir POS",
  "pos.supervise": "Persetujuan void POS",
  "admin.overview": "Ringkasan",
  "admin.sales": "Penjualan",
  "admin.reports": "Laporan",
  "admin.stock": "Persediaan",
  "admin.purchasing": "Pembelian",
  "admin.suppliers": "Supplier",
  "admin.roles": "Role & akses",
  "admin.ceo_chat": "CEO Copilot",
  "admin.products": "Master produk",
  "admin.live_transactions": "Transaksi live",
  "admin.operations": "Kasir, shift & pelanggan",
  "admin.finance": "Keuangan",
  "admin.settings": "Pengaturan",
};

const templateProductImages = [
  "01.jpg",
  "02.jpg",
  "03.jpg",
  "04.jpg",
  "05.jpg",
  "06.jpg",
  "07.jpg",
  "08.jpg",
  "09.jpg",
  "10.jpg",
  "11.jpg",
  "12.jpg",
  "13.jpg",
  "14.jpg",
  "15.jpg",
  "16.jpg",
  "17.jpg",
  "18.jpg",
  "19.jpg",
  "20.jpg",
  "21.jpg",
  "22.jpg",
  "23.jpg",
  "24.jpg",
  "25.jpg",
  "26.jpg",
  "27.jpg",
  "28.jpg",
].map((image) => `/ekomart/products/${image}`);
const emptyProductForm: ProductFormState = {
  barcode: "",
  sku: "",
  name: "",
  category: "",
  brand: "",
  unit: "pcs",
  unit_conversion: 1,
  location: "",
  image_url: templateProductImages[0],
  price: 0,
  cost_price: 0,
  reorder_level: 3,
  is_active: true,
};

const paymentLabels: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  edc: "EDC",
  debit: "Debit",
  credit: "Kredit",
  wallet: "E-Wallet",
  voucher: "Voucher",
};

const statusLabels: Record<PurchaseOrder["status"], string> = {
  draft: "Draft",
  ordered: "Dipesan",
  partially_received: "Diterima sebagian",
  received: "Selesai",
  cancelled: "Dibatalkan",
};

function defaultReportRange() {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - 29);
  return {
    from: dateFrom.toISOString().slice(0, 10),
    to: dateTo.toISOString().slice(0, 10),
  };
}

function formatMoney(value: number) {
  return moneyFormatter.format(value).replace(/\s/g, "");
}

function formatCompactMoney(value: number) {
  if (value === 0) return "Rp0";
  if (Math.abs(value) >= 1_000_000) {
    return `Rp${numberFormatter.format(Math.round(value / 1_000_000))} jt`;
  }
  return `Rp${numberFormatter.format(Math.round(value / 1_000))} rb`;
}

function formatDate(value: string | null) {
  return value
    ? dateFormatter.format(new Date(`${value}T00:00:00`))
    : "Belum ditentukan";
}

function orderQuantity(order: PurchaseOrder) {
  return order.items.reduce((total, item) => total + item.quantity_ordered, 0);
}

function StatusPill({ status }: { status: PurchaseOrder["status"] }) {
  const variants: Record<PurchaseOrder["status"], string> = {
    draft: "secondary",
    ordered: "info",
    partially_received: "warning",
    received: "success",
    cancelled: "danger",
  };
  return <Badge bg={variants[status]}>{statusLabels[status]}</Badge>;
}

export default function AdminPage() {
  const [view, setView] = useState<AdminView>("overview");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [sales, setSales] = useState<AdminSale[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [access, setAccess] = useState<AccessProfile | null>(null);
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [liveWorkflow, setLiveWorkflow] = useState<LiveWorkflowSnapshot>({
    generated_at: "",
    sessions: [],
  });
  const [liveConnected, setLiveConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<ModalName>(null);
  const [stockSearch, setStockSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productStatus, setProductStatus] = useState("all");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] =
    useState<ProductFormState>(emptyProductForm);
  const [salesSearch, setSalesSearch] = useState("");
  const [salesStatus, setSalesStatus] = useState("all");
  const [reportRange, setReportRange] = useState(defaultReportRange);
  const [supplierForm, setSupplierForm] = useState({
    code: "",
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  });
  const [purchaseSupplier, setPurchaseSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseNotes, setPurchaseNotes] = useState("");
  const [purchaseRequestKey, setPurchaseRequestKey] = useState("");
  const [purchaseLines, setPurchaseLines] = useState<PurchaseLine[]>([
    { key: "initial", barcode: "", quantity: 1, unitCost: 0 },
  ]);
  const [adjustmentProduct, setAdjustmentProduct] = useState("");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentArea, setAdjustmentArea] = useState<"warehouse" | "sales">(
    "sales",
  );
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [transferProduct, setTransferProduct] = useState("");
  const [transferQuantity, setTransferQuantity] = useState(1);
  const [transferDirection, setTransferDirection] = useState<
    "to_sales" | "to_warehouse"
  >("to_sales");
  const [transferNote, setTransferNote] = useState("");

  const refreshData = useCallback(async () => {
    if (!isApiConfigured) {
      setError(
        "Backend belum dikonfigurasi. Jalankan FastAPI dan isi NEXT_PUBLIC_API_URL.",
      );
      setLoading(false);
      return;
    }
    setError("");
    try {
      const nextAccess = await loadMyAccess();
      const can = (permission: string) =>
        nextAccess.permissions.includes(permission);
      const [
        nextDashboard,
        nextProducts,
        nextStock,
        nextSuppliers,
        nextOrders,
        nextSales,
        nextReport,
        nextRoles,
        nextStaff,
        nextLiveWorkflow,
      ] = await Promise.all([
        can("admin.overview") ? loadAdminDashboard() : Promise.resolve(null),
        can("admin.products") ? loadMasterProducts() : Promise.resolve([]),
        can("admin.stock") || can("admin.purchasing")
          ? loadAdminStock()
          : Promise.resolve([]),
        can("admin.suppliers") || can("admin.purchasing")
          ? loadSuppliers()
          : Promise.resolve([]),
        can("admin.purchasing") ? loadPurchaseOrders() : Promise.resolve([]),
        can("admin.sales") ? loadAdminSales() : Promise.resolve([]),
        can("admin.reports") || can("admin.overview")
          ? loadSalesReport()
          : Promise.resolve(null),
        can("admin.roles") ? loadRoles() : Promise.resolve([]),
        can("admin.roles") ? loadStaff() : Promise.resolve([]),
        can("admin.live_transactions")
          ? loadLiveTransactions()
          : Promise.resolve({ generated_at: "", sessions: [] }),
      ]);
      setAccess(nextAccess);
      setDashboard(nextDashboard);
      setMasterProducts(nextProducts);
      setStock(nextStock);
      setSuppliers(nextSuppliers);
      setOrders(nextOrders);
      setSales(nextSales);
      setReport(nextReport);
      setRoles(nextRoles);
      setStaff(nextStaff);
      setLiveWorkflow(nextLiveWorkflow);
      if (nextReport)
        setReportRange({ from: nextReport.date_from, to: nextReport.date_to });
      setPurchaseSupplier((current) => current || nextSuppliers[0]?.id || "");
      setAdjustmentProduct((current) => current || nextStock[0]?.id || "");
      setTransferProduct((current) => current || nextStock[0]?.id || "");
      const allowedViews = navigation.filter((item) => can(item.permission));
      setView((current) =>
        allowedViews.some((item) => item.id === current)
          ? current
          : allowedViews[0]?.id || current,
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Data admin gagal dimuat",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previous = {
      sidenav: root.dataset.sidenavSize,
      menu: root.dataset.menuColor,
      topbar: root.dataset.topbarColor,
      theme: root.dataset.bsTheme,
    };
    const syncSidenav = () => {
      root.dataset.sidenavSize = window.innerWidth < 768 ? "full" : "default";
      if (window.innerWidth >= 768) root.classList.remove("sidebar-enable");
    };
    root.dataset.menuColor = "light";
    root.dataset.topbarColor = "light";
    root.dataset.bsTheme = "light";
    syncSidenav();
    window.addEventListener("resize", syncSidenav);
    return () => {
      window.removeEventListener("resize", syncSidenav);
      root.classList.remove("sidebar-enable");
      if (previous.sidenav) root.dataset.sidenavSize = previous.sidenav;
      else delete root.dataset.sidenavSize;
      if (previous.menu) root.dataset.menuColor = previous.menu;
      else delete root.dataset.menuColor;
      if (previous.topbar) root.dataset.topbarColor = previous.topbar;
      else delete root.dataset.topbarColor;
      if (previous.theme) root.dataset.bsTheme = previous.theme;
      else delete root.dataset.bsTheme;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void refreshData());
    return () => window.cancelAnimationFrame(frame);
  }, [refreshData]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (
      !isApiConfigured ||
      !access?.permissions.includes("admin.live_transactions")
    )
      return;
    let stopped = false;
    let reconnectTimer = 0;
    let controller = new AbortController();

    const connect = async () => {
      setLiveConnected(false);
      controller = new AbortController();
      try {
        await streamLiveTransactions((snapshot) => {
          if (stopped) return;
          setLiveWorkflow(snapshot);
          setLiveConnected(true);
        }, controller.signal);
      } catch (caught) {
        if (
          stopped ||
          (caught instanceof DOMException && caught.name === "AbortError")
        )
          return;
        setLiveConnected(false);
      }
      if (!stopped)
        reconnectTimer = window.setTimeout(() => void connect(), 1500);
    };

    void connect();
    return () => {
      stopped = true;
      controller.abort();
      window.clearTimeout(reconnectTimer);
      setLiveConnected(false);
    };
  }, [access]);

  const filteredStock = useMemo(() => {
    const query = stockSearch.trim().toLocaleLowerCase("id-ID");
    if (!query) return stock;
    return stock.filter(
      (item) =>
        item.name.toLocaleLowerCase("id-ID").includes(query) ||
        item.barcode.includes(query) ||
        item.category.toLocaleLowerCase("id-ID").includes(query),
    );
  }, [stock, stockSearch]);

  const filteredMasterProducts = useMemo(() => {
    const query = productSearch.trim().toLocaleLowerCase("id-ID");
    return masterProducts.filter((product) => {
      const matchesStatus =
        productStatus === "all" ||
        (productStatus === "active" ? product.is_active : !product.is_active);
      const matchesQuery =
        !query ||
        [
          product.name,
          product.barcode,
          product.sku || "",
          product.category,
        ].some((value) => value.toLocaleLowerCase("id-ID").includes(query));
      return matchesStatus && matchesQuery;
    });
  }, [masterProducts, productSearch, productStatus]);

  const filteredSales = useMemo(() => {
    const query = salesSearch.trim().toLocaleLowerCase("id-ID");
    return sales.filter((sale) => {
      const matchesStatus =
        salesStatus === "all" || sale.status === salesStatus;
      const matchesQuery =
        !query ||
        [
          sale.transaction_no,
          sale.cashier_name,
          sale.member_name || "",
          ...sale.items.flatMap((item) => [item.product_name, item.barcode]),
        ].some((value) => value.toLocaleLowerCase("id-ID").includes(query));
      return matchesStatus && matchesQuery;
    });
  }, [sales, salesSearch, salesStatus]);

  const visibleNavigation = useMemo(
    () =>
      access
        ? navigation.filter((item) =>
            access.permissions.includes(item.permission),
          )
        : navigation,
    [access],
  );
  const purchaseTotal = useMemo(
    () =>
      purchaseLines.reduce(
        (total, line) => total + line.quantity * line.unitCost,
        0,
      ),
    [purchaseLines],
  );
  const currentTitle =
    visibleNavigation.find((item) => item.id === view)?.label || "Admin";
  const operationsTab = operationsViewTabs[view];

  function showToast(message: string) {
    setToast(message);
  }

  function openProductModal(product?: MasterProduct) {
    if (product) {
      setEditingProductId(product.id);
      setProductForm({
        barcode: product.barcode,
        sku: product.sku || "",
        name: product.name,
        category: product.category,
        brand: product.brand || "",
        unit: product.unit,
        unit_conversion: product.unit_conversion,
        location: product.location,
        image_url: product.image_url || templateProductImages[0],
        price: product.price,
        cost_price: product.cost_price,
        reorder_level: product.reorder_level,
        is_active: product.is_active,
      });
    } else {
      setEditingProductId(null);
      setProductForm({ ...emptyProductForm });
    }
    setModal("product");
  }

  async function submitProductForm(event: FormEvent) {
    event.preventDefault();
    setWorking(true);
    setError("");
    try {
      const saved = editingProductId
        ? await updateMasterProduct(editingProductId, productForm)
        : await createMasterProduct(productForm);
      setMasterProducts((current) => {
        const products = editingProductId
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
        return products.sort((left, right) =>
          left.name.localeCompare(right.name, "id-ID"),
        );
      });
      setModal(null);
      showToast(
        editingProductId
          ? "Produk berhasil diperbarui."
          : "Produk baru berhasil ditambahkan.",
      );
      await refreshData();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Produk gagal disimpan",
      );
    } finally {
      setWorking(false);
    }
  }

  async function deactivateProduct(product: MasterProduct) {
    if (
      !window.confirm(
        `Nonaktifkan ${product.name}? Produk tidak akan tampil di kasir.`,
      )
    )
      return;
    setWorking(true);
    setError("");
    try {
      const archived = await archiveMasterProduct(product.id);
      setMasterProducts((current) =>
        current.map((item) => (item.id === archived.id ? archived : item)),
      );
      showToast(`${product.name} dinonaktifkan.`);
      await refreshData();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Produk gagal dinonaktifkan",
      );
    } finally {
      setWorking(false);
    }
  }

  function exportProducts() {
    const rows = [
      [
        "SKU",
        "Barcode",
        "Nama",
        "Kategori",
        "Lokasi",
        "Harga Beli",
        "Harga Jual",
        "Stok",
        "Status",
      ],
      ...filteredMasterProducts.map((product) => [
        product.sku || "",
        product.barcode,
        product.name,
        product.category,
        product.location,
        product.cost_price,
        product.price,
        product.stock + product.warehouse_stock,
        product.is_active ? "Aktif" : "Nonaktif",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "master-produk-mymarket.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function openView(nextView: AdminView) {
    setView(nextView);
    document.documentElement.classList.remove("sidebar-enable");
  }

  async function applyReportRange(nextRange = reportRange) {
    setWorking(true);
    setError("");
    try {
      const nextReport = await loadSalesReport(nextRange.from, nextRange.to);
      setReportRange(nextRange);
      setReport(nextReport);
      showToast("Rentang laporan diperbarui.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Laporan gagal dimuat",
      );
    } finally {
      setWorking(false);
    }
  }

  function exportReport() {
    if (!report) return;
    const escapeCsv = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ["RINGKASAN HARIAN"],
      ["Tanggal", "Transaksi", "Omzet", "Laba Kotor"],
      ...report.daily_sales.map((item) => [
        item.date,
        item.transaction_count,
        item.total_sales,
        item.gross_profit,
      ]),
      [],
      ["PERFORMA PRODUK"],
      [
        "Barcode",
        "Produk",
        "Kategori",
        "Transaksi",
        "Unit",
        "Omzet Bersih",
        "HPP",
        "Laba Kotor",
        "Margin (%)",
      ],
      ...report.product_performance.map((item) => [
        item.barcode,
        item.name,
        item.category,
        item.transaction_count,
        item.quantity,
        item.net_revenue,
        item.cost_of_goods,
        item.gross_profit,
        item.margin_percentage,
      ]),
      [],
      ["DETAIL TRANSAKSI DAN BARANG"],
      [
        "Tanggal",
        "No Transaksi",
        "Kasir",
        "Metode",
        "Barcode",
        "Produk",
        "Qty",
        "Harga",
        "Diskon",
        "Subtotal",
        "Laba Kotor",
      ],
      ...report.transactions.flatMap((sale) =>
        sale.items.map((item) => [
          sale.created_at,
          sale.transaction_no,
          sale.cashier_name,
          sale.payment_method || "",
          item.barcode,
          item.product_name,
          item.quantity,
          item.unit_price,
          item.discount,
          item.subtotal,
          item.gross_profit,
        ]),
      ),
    ];
    const csv = rows
      .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `laporan-mymarket-${report.date_from}-${report.date_to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function openPurchaseModal() {
    setPurchaseLines([
      { key: crypto.randomUUID(), barcode: "", quantity: 1, unitCost: 0 },
    ]);
    setPurchaseSupplier(suppliers[0]?.id || "");
    setPurchaseDate("");
    setPurchaseNotes("");
    setPurchaseRequestKey(crypto.randomUUID());
    setModal("purchase");
  }

  function updatePurchaseLine(key: string, update: Partial<PurchaseLine>) {
    setPurchaseLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...update } : line)),
    );
  }

  function selectLineProduct(key: string, barcode: string) {
    const product = stock.find((item) => item.barcode === barcode);
    updatePurchaseLine(key, { barcode, unitCost: product?.cost_price ?? 0 });
  }

  async function submitSupplierForm(event: FormEvent) {
    event.preventDefault();
    setWorking(true);
    try {
      await createSupplier(supplierForm);
      setSupplierForm({
        code: "",
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
      });
      setModal(null);
      await refreshData();
      setView("purchasing");
      showToast("Supplier baru berhasil disimpan.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Supplier gagal disimpan",
      );
    } finally {
      setWorking(false);
    }
  }

  async function submitPurchaseForm(event: FormEvent) {
    event.preventDefault();
    const validLines = purchaseLines.filter(
      (line) => line.barcode && line.quantity > 0,
    );
    if (!purchaseSupplier || validLines.length === 0) {
      setError("Pilih supplier dan minimal satu produk.");
      return;
    }
    setWorking(true);
    setError("");
    try {
      await recordPurchase(
        {
          supplier_id: purchaseSupplier,
          store_code: "MY-001",
          purchase_date: purchaseDate || undefined,
          notes: purchaseNotes || undefined,
          items: validLines.map((line) => ({
            barcode: line.barcode,
            quantity: line.quantity,
            unit_cost: line.unitCost,
          })),
        },
        purchaseRequestKey || crypto.randomUUID(),
      );
      setModal(null);
      await refreshData();
      setView("purchasing");
      showToast("Pembelian dicatat dan stok gudang sudah bertambah.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Pembelian gagal dicatat",
      );
    } finally {
      setWorking(false);
    }
  }

  function openAdjustment(product?: StockItem) {
    setAdjustmentProduct(product?.id || stock[0]?.id || "");
    setAdjustmentQuantity(0);
    setAdjustmentArea("sales");
    setAdjustmentNote("");
    setModal("adjustment");
  }

  async function submitAdjustment(event: FormEvent) {
    event.preventDefault();
    if (
      !adjustmentProduct ||
      adjustmentQuantity === 0 ||
      !adjustmentNote.trim()
    ) {
      setError("Pilih produk, isi perubahan jumlah, dan alasan koreksi.");
      return;
    }
    setWorking(true);
    try {
      await createStockAdjustment({
        product_id: adjustmentProduct,
        quantity_change: adjustmentQuantity,
        area: adjustmentArea,
        note: adjustmentNote.trim(),
      });
      setModal(null);
      await refreshData();
      setView("stock");
      showToast("Koreksi stok berhasil dicatat.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Koreksi stok gagal");
    } finally {
      setWorking(false);
    }
  }

  function openTransfer(product?: StockItem) {
    setTransferProduct(product?.id || stock[0]?.id || "");
    setTransferQuantity(1);
    setTransferDirection("to_sales");
    setTransferNote("");
    setModal("transfer");
  }

  async function submitTransfer(event: FormEvent) {
    event.preventDefault();
    if (!transferProduct || transferQuantity < 1) {
      setError("Pilih produk dan isi jumlah transfer.");
      return;
    }
    setWorking(true);
    try {
      await createStockTransfer({
        product_id: transferProduct,
        quantity: transferQuantity,
        from_area: transferDirection === "to_sales" ? "warehouse" : "sales",
        to_area: transferDirection === "to_sales" ? "sales" : "warehouse",
        note: transferNote.trim() || undefined,
      });
      setModal(null);
      await refreshData();
      setView("stock");
      showToast("Transfer stok berhasil dicatat.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Transfer stok gagal",
      );
    } finally {
      setWorking(false);
    }
  }

  async function saveRole(role: AccessRole, permissions: string[]) {
    setWorking(true);
    try {
      await updateRole(role.id, { permissions });
      await refreshData();
      showToast(`Akses ${role.name} berhasil diperbarui.`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Role gagal diperbarui",
      );
    } finally {
      setWorking(false);
    }
  }

  async function changeStaffRole(staffId: string, roleId: string) {
    setWorking(true);
    try {
      await assignStaffRole(staffId, roleId);
      await refreshData();
      showToast("Role petugas berhasil diperbarui.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Role petugas gagal diperbarui",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <AdmintoShell
      title={currentTitle}
      navigation={visibleNavigation}
      activeView={view}
      fullName={access?.full_name}
      roleName={access?.role_name}
      employeeCode={access?.employee_code}
      lowStockCount={dashboard?.low_stock_count}
      showCeoCopilot={access?.permissions.includes("admin.ceo_chat")}
      showPos={access?.permissions.includes("pos.access")}
      onView={(nextView) => openView(nextView as AdminView)}
    >
      {error ? (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
          role="alert"
          className="d-flex align-items-center gap-2"
        >
          <Icon icon="solar:danger-triangle-bold-duotone" width={20} />
          <span>{error}</span>
        </Alert>
      ) : null}
      {loading ? <AdminLoading /> : null}
      {!loading && !access ? (
        <Card>
          <Card.Body className="text-center py-5">
            <span className="avatar-xl bg-warning-subtle text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
              <Icon icon="solar:server-square-cloud-bold-duotone" width={38} />
            </span>
            <h4>Data admin belum dapat ditampilkan</h4>
            <p className="text-muted">
              Pastikan backend aktif, lalu muat ulang data tanpa meninggalkan
              halaman ini.
            </p>
            <Button
              onClick={() => {
                setLoading(true);
                void refreshData();
              }}
            >
              <Icon
                icon="solar:refresh-circle-linear"
                width={18}
                className="me-1"
              />{" "}
              Muat ulang
            </Button>
          </Card.Body>
        </Card>
      ) : null}
      {!loading && view === "overview" && dashboard && report ? (
        <Overview
          dashboard={dashboard}
          report={report}
          onOpenPurchasing={() => openView("purchasing")}
          onOpenStock={() => openView("stock")}
          onOpenSales={() => openView("sales")}
          onOpenReports={() => openView("reports")}
        />
      ) : null}
      {!loading && view === "live" ? (
        <LiveTransactionsView
          snapshot={liveWorkflow}
          connected={liveConnected}
        />
      ) : null}
      {!loading && view === "products" ? (
        <ProductMasterView
          products={filteredMasterProducts}
          search={productSearch}
          status={productStatus}
          working={working}
          onSearch={setProductSearch}
          onStatus={setProductStatus}
          onAdd={() => openProductModal()}
          onEdit={openProductModal}
          onDeactivate={(product) => void deactivateProduct(product)}
          onExport={exportProducts}
        />
      ) : null}
      {!loading && view === "sales" ? (
        <SalesView
          sales={filteredSales}
          search={salesSearch}
          status={salesStatus}
          onSearch={setSalesSearch}
          onStatus={setSalesStatus}
        />
      ) : null}
      {!loading && view === "reports" && report ? (
        <ReportsView
          report={report}
          range={reportRange}
          working={working}
          onRangeChange={setReportRange}
          onApply={(nextRange) => void applyReportRange(nextRange)}
          onExport={exportReport}
        />
      ) : null}
      {!loading && view === "purchasing" ? (
        <>
          <PurchasingView orders={orders} onCreateOrder={openPurchaseModal} />
          <SuppliersView
            suppliers={suppliers}
            onAdd={() => setModal("supplier")}
          />
        </>
      ) : null}
      {!loading && view === "stock" ? (
        <StockView
          stock={filteredStock}
          search={stockSearch}
          onSearch={setStockSearch}
          onAdjust={openAdjustment}
          onTransfer={openTransfer}
          onCreateOrder={
            access?.permissions.includes("admin.purchasing")
              ? openPurchaseModal
              : undefined
          }
        />
      ) : null}
      {!loading && view === "access" ? (
        <AccessView
          roles={roles}
          staff={staff}
          working={working}
          onSaveRole={(role, permissions) => void saveRole(role, permissions)}
          onAssignRole={(staffId, roleId) =>
            void changeStaffRole(staffId, roleId)
          }
        />
      ) : null}
      {!loading && operationsTab ? (
        <OperationsCenter
          activeTab={operationsTab}
          products={masterProducts}
          suppliers={suppliers}
          orders={orders}
          roles={roles}
          onChanged={refreshData}
        />
      ) : null}

      <Modal
        show={modal === "product"}
        onHide={() => setModal(null)}
        size="lg"
        centered
        aria-labelledby="product-title"
      >
        <Form onSubmit={submitProductForm}>
          <Modal.Header closeButton>
            <div>
              <small className="text-muted">Katalog MYMARKET</small>
              <Modal.Title id="product-title">
                {editingProductId ? "Edit produk" : "Tambah produk"}
              </Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-4">
              <Col md={4}>
                <Card className="border h-100 mb-0">
                  <Card.Body className="d-flex flex-column align-items-center text-center">
                    <div
                      className="bg-light rounded-3 w-100 d-flex align-items-center justify-content-center mb-3"
                      style={{ minHeight: 220 }}
                    >
                      {productForm.image_url ? (
                        <Image
                          src={productForm.image_url}
                          alt="Preview produk"
                          width={210}
                          height={210}
                          className="img-fluid object-fit-contain"
                        />
                      ) : (
                        <Icon
                          icon="solar:gallery-add-bold-duotone"
                          width={54}
                          className="text-muted"
                        />
                      )}
                    </div>
                    <h5 className="mb-1">Foto produk</h5>
                    <p className="text-muted fs-12">
                      Aset produk asli dari template Adminto.
                    </p>
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                      {templateProductImages.map((image) => (
                        <Button
                          key={image}
                          type="button"
                          variant={
                            productForm.image_url === image
                              ? "primary"
                              : "light"
                          }
                          className="p-1"
                          onClick={() =>
                            setProductForm({ ...productForm, image_url: image })
                          }
                        >
                          <Image
                            src={image}
                            alt="Pilihan foto"
                            width={42}
                            height={42}
                            className="object-fit-contain"
                          />
                        </Button>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={8}>
                <Row className="g-3">
                  <Col xs={12}>
                    <Form.Group controlId="product-name">
                      <Form.Label>Nama produk</Form.Label>
                      <Form.Control
                        value={productForm.name}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            name: event.target.value,
                          })
                        }
                        placeholder="Nama produk"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-barcode">
                      <Form.Label>Barcode</Form.Label>
                      <Form.Control
                        value={productForm.barcode}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            barcode: event.target.value,
                          })
                        }
                        placeholder="8997000001006"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-sku">
                      <Form.Label>SKU</Form.Label>
                      <Form.Control
                        value={productForm.sku}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            sku: event.target.value.toUpperCase(),
                          })
                        }
                        placeholder="SKU-PRODUK"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-category">
                      <Form.Label>Kategori</Form.Label>
                      <Form.Control
                        value={productForm.category}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            category: event.target.value,
                          })
                        }
                        placeholder="Fashion"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-brand">
                      <Form.Label>Merek</Form.Label>
                      <Form.Control
                        value={productForm.brand || ""}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            brand: event.target.value,
                          })
                        }
                        placeholder="Nama merek"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-unit">
                      <Form.Label>Satuan</Form.Label>
                      <SearchableSelect
                        value={productForm.unit || "pcs"}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            unit: event.target.value,
                          })
                        }
                      >
                        <option value="pcs">pcs</option>
                        <option value="pack">pack</option>
                        <option value="dus">dus</option>
                        <option value="kg">kg</option>
                        <option value="liter">liter</option>
                      </SearchableSelect>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-conversion">
                      <Form.Label>Isi per satuan</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={productForm.unit_conversion || 1}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            unit_conversion: Number(event.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-location">
                      <Form.Label>Lokasi</Form.Label>
                      <Form.Control
                        value={productForm.location}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            location: event.target.value,
                          })
                        }
                        placeholder="Rak F-01"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-cost">
                      <Form.Label>Harga beli</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={productForm.cost_price}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            cost_price: Number(event.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-price">
                      <Form.Label>Harga jual</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={productForm.price}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            price: Number(event.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="product-reorder">
                      <Form.Label>Batas stok minimum</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={productForm.reorder_level}
                        onChange={(event) =>
                          setProductForm({
                            ...productForm,
                            reorder_level: Number(event.target.value),
                          })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="d-flex align-items-end">
                    <Form.Check
                      type="switch"
                      id="product-active"
                      label="Produk aktif dan tampil di kasir"
                      checked={productForm.is_active}
                      onChange={(event) =>
                        setProductForm({
                          ...productForm,
                          is_active: event.target.checked,
                        })
                      }
                    />
                  </Col>
                  {editingProductId ? (
                    <Col xs={12}>
                      <div className="alert alert-light border mb-0">
                        <Icon
                          icon="solar:info-circle-linear"
                          width={18}
                          className="me-1"
                        />
                        Stok tidak diedit di sini. Gunakan menu Persediaan agar
                        perubahan tetap tercatat di audit.
                      </div>
                    </Col>
                  ) : null}
                </Row>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              type="button"
              onClick={() => setModal(null)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={working}>
              {working ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <Icon
                  icon="solar:diskette-linear"
                  width={17}
                  className="me-1"
                />
              )}
              {editingProductId ? "Simpan perubahan" : "Tambah produk"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={modal === "purchase"}
        onHide={() => setModal(null)}
        size="xl"
        centered
        aria-labelledby="purchase-title"
      >
        <Form onSubmit={submitPurchaseForm}>
          <Modal.Header closeButton>
            <div>
              <small className="text-muted">Barang masuk gudang</small>
              <Modal.Title id="purchase-title">Catat pembelian</Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3 mb-4">
              <Col md={7}>
                <Form.Group controlId="purchase-supplier">
                  <Form.Label>Supplier</Form.Label>
                  <SearchableSelect
                    value={purchaseSupplier}
                    onChange={(event) =>
                      setPurchaseSupplier(event.target.value)
                    }
                    required
                  >
                    <option value="">Pilih supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </SearchableSelect>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId="purchase-date">
                  <Form.Label>Tanggal pembelian</Form.Label>
                  <Form.Control
                    type="date"
                    value={purchaseDate}
                    onChange={(event) => setPurchaseDate(event.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <h5 className="mb-0">Daftar barang</h5>
                <small className="text-muted">
                  Harga beli dapat disesuaikan sebelum disimpan.
                </small>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                type="button"
                onClick={() =>
                  setPurchaseLines((lines) => [
                    ...lines,
                    {
                      key: crypto.randomUUID(),
                      barcode: "",
                      quantity: 1,
                      unitCost: 0,
                    },
                  ])
                }
              >
                <Icon
                  icon="solar:add-circle-linear"
                  width={17}
                  className="me-1"
                />{" "}
                Tambah baris
              </Button>
            </div>
            <div className="d-flex flex-column gap-2">
              {purchaseLines.map((line, index) => (
                <Card key={line.key} className="border mb-0">
                  <Card.Body className="p-3">
                    <Row className="g-2 align-items-end">
                      <Col xs="auto">
                        <Badge bg="primary" className="mb-2">
                          {index + 1}
                        </Badge>
                      </Col>
                      <Col lg={5} md={11}>
                        <Form.Label>Produk</Form.Label>
                        <SearchableSelect
                          value={line.barcode}
                          onChange={(event) =>
                            selectLineProduct(line.key, event.target.value)
                          }
                          required
                        >
                          <option value="">Pilih produk</option>
                          {stock.map((product) => (
                            <option key={product.id} value={product.barcode}>
                              {product.name} · gudang {product.warehouse_stock}{" "}
                              · kasir {product.sales_stock}
                            </option>
                          ))}
                        </SearchableSelect>
                      </Col>
                      <Col lg={2} md={4}>
                        <Form.Label>Jumlah</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max="100000"
                          value={line.quantity}
                          onChange={(event) =>
                            updatePurchaseLine(line.key, {
                              quantity: Number(event.target.value),
                            })
                          }
                        />
                      </Col>
                      <Col lg={2} md={4}>
                        <Form.Label>Harga beli</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          value={line.unitCost}
                          onChange={(event) =>
                            updatePurchaseLine(line.key, {
                              unitCost: Number(event.target.value),
                            })
                          }
                        />
                      </Col>
                      <Col lg={2} md={3} className="text-end">
                        <strong className="d-block mb-2">
                          {formatMoney(line.quantity * line.unitCost)}
                        </strong>
                      </Col>
                      <Col xs="auto">
                        <Button
                          variant="soft-danger"
                          type="button"
                          disabled={purchaseLines.length === 1}
                          onClick={() =>
                            setPurchaseLines((lines) =>
                              lines.filter((item) => item.key !== line.key),
                            )
                          }
                          aria-label="Hapus baris"
                        >
                          <Icon
                            icon="solar:trash-bin-trash-linear"
                            width={17}
                          />
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
            <Form.Group className="mt-3" controlId="purchase-notes">
              <Form.Label>Catatan pembelian</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={purchaseNotes}
                onChange={(event) => setPurchaseNotes(event.target.value)}
                placeholder="Contoh: faktur INV-1024, dibayar tunai"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="justify-content-between">
            <div>
              <small className="text-muted d-block">Total pembelian</small>
              <strong className="fs-5">{formatMoney(purchaseTotal)}</strong>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="light"
                type="button"
                onClick={() => setModal(null)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={working}>
                {working ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  <Icon
                    icon="solar:clipboard-check-linear"
                    width={17}
                    className="me-1"
                  />
                )}
                Simpan ke gudang
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={modal === "supplier"}
        onHide={() => setModal(null)}
        centered
        aria-labelledby="supplier-title"
      >
        <Form onSubmit={submitSupplierForm}>
          <Modal.Header closeButton>
            <div>
              <small className="text-muted">Mitra pengadaan</small>
              <Modal.Title id="supplier-title">Supplier baru</Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={5}>
                <Form.Group controlId="supplier-code">
                  <Form.Label>Kode supplier</Form.Label>
                  <Form.Control
                    value={supplierForm.code}
                    onChange={(event) =>
                      setSupplierForm({
                        ...supplierForm,
                        code: event.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SUP-004"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={7}>
                <Form.Group controlId="supplier-name">
                  <Form.Label>Nama perusahaan</Form.Label>
                  <Form.Control
                    value={supplierForm.name}
                    onChange={(event) =>
                      setSupplierForm({
                        ...supplierForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="PT Mitra Distribusi"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="supplier-contact">
                  <Form.Label>Kontak utama</Form.Label>
                  <Form.Control
                    value={supplierForm.contact_person}
                    onChange={(event) =>
                      setSupplierForm({
                        ...supplierForm,
                        contact_person: event.target.value,
                      })
                    }
                    placeholder="Nama sales"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="supplier-phone">
                  <Form.Label>Nomor telepon</Form.Label>
                  <Form.Control
                    value={supplierForm.phone}
                    onChange={(event) =>
                      setSupplierForm({
                        ...supplierForm,
                        phone: event.target.value,
                      })
                    }
                    placeholder="08xx xxxx xxxx"
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId="supplier-email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={supplierForm.email}
                    onChange={(event) =>
                      setSupplierForm({
                        ...supplierForm,
                        email: event.target.value,
                      })
                    }
                    placeholder="order@supplier.id"
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId="supplier-address">
                  <Form.Label>Alamat</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={supplierForm.address}
                    onChange={(event) =>
                      setSupplierForm({
                        ...supplierForm,
                        address: event.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              type="button"
              onClick={() => setModal(null)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={working}>
              {working ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <Icon
                  icon="solar:diskette-linear"
                  width={17}
                  className="me-1"
                />
              )}
              Simpan supplier
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={modal === "adjustment"}
        onHide={() => setModal(null)}
        centered
        aria-labelledby="adjustment-title"
      >
        <Form onSubmit={submitAdjustment}>
          <Modal.Header closeButton>
            <div>
              <small className="text-muted">Stok opname</small>
              <Modal.Title id="adjustment-title">
                Koreksi persediaan
              </Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column gap-3">
            <Form.Group controlId="adjustment-product">
              <Form.Label>Produk</Form.Label>
              <SearchableSelect
                value={adjustmentProduct}
                onChange={(event) => setAdjustmentProduct(event.target.value)}
              >
                {stock.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · gudang {product.warehouse_stock} · kasir{" "}
                    {product.sales_stock}
                  </option>
                ))}
              </SearchableSelect>
            </Form.Group>
            <Form.Group controlId="adjustment-area">
              <Form.Label>Lokasi stok</Form.Label>
              <SearchableSelect
                value={adjustmentArea}
                onChange={(event) =>
                  setAdjustmentArea(event.target.value as "warehouse" | "sales")
                }
              >
                <option value="sales">Kasir / rak penjualan</option>
                <option value="warehouse">Gudang</option>
              </SearchableSelect>
            </Form.Group>
            <Form.Group controlId="adjustment-quantity">
              <Form.Label>Perubahan jumlah</Form.Label>
              <Form.Control
                type="number"
                value={adjustmentQuantity}
                onChange={(event) =>
                  setAdjustmentQuantity(Number(event.target.value))
                }
              />
              <Form.Text>
                Gunakan angka negatif untuk mengurangi stok.
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="adjustment-note">
              <Form.Label>Alasan koreksi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={adjustmentNote}
                onChange={(event) => setAdjustmentNote(event.target.value)}
                placeholder="Contoh: 2 unit rusak saat stok opname"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              type="button"
              onClick={() => setModal(null)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={working}>
              {working ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <Icon
                  icon="solar:diskette-linear"
                  width={17}
                  className="me-1"
                />
              )}
              Simpan koreksi
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={modal === "transfer"}
        onHide={() => setModal(null)}
        centered
        aria-labelledby="transfer-title"
      >
        <Form onSubmit={submitTransfer}>
          <Modal.Header closeButton>
            <div>
              <small className="text-muted">Mutasi internal</small>
              <Modal.Title id="transfer-title">Transfer stok</Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column gap-3">
            <Form.Group controlId="transfer-product">
              <Form.Label>Produk</Form.Label>
              <SearchableSelect
                value={transferProduct}
                onChange={(event) => setTransferProduct(event.target.value)}
              >
                {stock.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · gudang {product.warehouse_stock} · kasir{" "}
                    {product.sales_stock}
                  </option>
                ))}
              </SearchableSelect>
            </Form.Group>
            <Form.Group controlId="transfer-direction">
              <Form.Label>Arah transfer</Form.Label>
              <SearchableSelect
                value={transferDirection}
                onChange={(event) =>
                  setTransferDirection(
                    event.target.value as "to_sales" | "to_warehouse",
                  )
                }
              >
                <option value="to_sales">Gudang → kasir</option>
                <option value="to_warehouse">Kasir → gudang</option>
              </SearchableSelect>
            </Form.Group>
            <Form.Group controlId="transfer-quantity">
              <Form.Label>Jumlah</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="100000"
                value={transferQuantity}
                onChange={(event) =>
                  setTransferQuantity(Number(event.target.value))
                }
              />
            </Form.Group>
            <Form.Group controlId="transfer-note">
              <Form.Label>Catatan</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={transferNote}
                onChange={(event) => setTransferNote(event.target.value)}
                placeholder="Contoh: pengisian rak untuk shift sore"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              type="button"
              onClick={() => setModal(null)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={working}>
              {working ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <Icon
                  icon="solar:transfer-horizontal-linear"
                  width={17}
                  className="me-1"
                />
              )}
              Pindahkan stok
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {toast ? (
        <div className="toast-container position-fixed end-0 bottom-0 p-3">
          <div className="toast show text-bg-success border-0" role="status">
            <div className="toast-body d-flex align-items-center gap-2">
              <Icon icon="solar:check-circle-bold" width={20} />
              <span>{toast}</span>
            </div>
          </div>
        </div>
      ) : null}
    </AdmintoShell>
  );
}

function AdminLoading() {
  return (
    <div aria-live="polite" aria-busy="true">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Spinner size="sm" />
        <span>Menyiapkan data operasional…</span>
      </div>
      <Row className="g-3 mb-3">
        {[0, 1, 2, 3].map((item) => (
          <Col xl={3} md={6} key={item}>
            <Card>
              <Card.Body>
                <span className="placeholder col-5 mb-3" />
                <span className="placeholder col-8 d-block fs-3" />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Card>
        <Card.Body>
          <span className="placeholder col-4 mb-3" />
          <span className="placeholder col-12 d-block mb-2" />
          <span className="placeholder col-9 d-block" />
        </Card.Body>
      </Card>
    </div>
  );
}

function Overview({
  dashboard,
  report,
  onOpenPurchasing,
  onOpenStock,
  onOpenSales,
  onOpenReports,
}: {
  dashboard: AdminDashboard;
  report: SalesReport;
  onOpenPurchasing: () => void;
  onOpenStock: () => void;
  onOpenSales: () => void;
  onOpenReports: () => void;
}) {
  const healthyStock = dashboard.product_count
    ? Math.max(
        0,
        ((dashboard.product_count - dashboard.low_stock_count) /
          dashboard.product_count) *
          100,
      )
    : 100;
  const salesStockShare = dashboard.stock_units
    ? (dashboard.sales_stock_units / dashboard.stock_units) * 100
    : 0;
  return (
    <>
      <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1">
        <Col>
          <OverviewMetricCard
            title="Total Transaksi"
            value={numberFormatter.format(report.transaction_count)}
            note="Dalam periode laporan"
            percentage={Math.min(100, Math.max(1, report.transaction_count))}
            color="#ff5b5b"
            radial
            onClick={onOpenSales}
          />
        </Col>
        <Col>
          <OverviewMetricCard
            title="Total Omzet"
            value={formatMoney(report.total_sales)}
            note="Dalam periode laporan"
            percentage={Math.min(
              100,
              Math.max(1, report.total_sales / 1_000_000),
            )}
            variant="success"
            onClick={onOpenReports}
          />
        </Col>
        <Col>
          <OverviewMetricCard
            title="Item Terjual"
            value={numberFormatter.format(report.item_count)}
            note="Dalam periode laporan"
            percentage={Math.min(100, Math.max(1, report.item_count))}
            color="#f9c851"
            radial
            onClick={onOpenSales}
          />
        </Col>
        <Col>
          <OverviewMetricCard
            title="Stok Sehat"
            value={`${healthyStock.toFixed(1)}%`}
            note={`${dashboard.low_stock_count} produk perlu dicek`}
            percentage={healthyStock}
            variant="info"
            onClick={onOpenStock}
          />
        </Col>
      </Row>

      <Row>
        <Col xxl={6} xl={6}>
          <OverviewOrdersChart report={report} />
        </Col>
        <Col xxl={6} xl={6}>
          <OverviewStatistics report={report} />
        </Col>
        <Col xxl={12} xl={12}>
          <OverviewRevenue
            dashboard={dashboard}
            report={report}
            salesStockShare={salesStockShare}
          />
        </Col>
      </Row>

      <OverviewSaleCards
        sales={report.recent_sales}
        onOpenSales={onOpenSales}
      />

      <Row>
        <Col xxl={6}>
          <OverviewPurchases dashboard={dashboard} onOpen={onOpenPurchasing} />
        </Col>
        <Col xxl={6}>
          <OverviewTopProducts report={report} onOpen={onOpenReports} />
        </Col>
      </Row>
    </>
  );
}

function OverviewCardMenu({ onClick }: { onClick?: () => void }) {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as="button"
        className="drop-arrow-none card-drop border-0 bg-transparent p-0"
        aria-label="Menu kartu"
      >
        <Icon icon="ri:more-2-fill" className="fs-18" />
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu-end">
        <Dropdown.Item onClick={onClick}>Lihat laporan</Dropdown.Item>
        <Dropdown.Item onClick={onClick}>Muat data</Dropdown.Item>
        <Dropdown.Item onClick={onClick}>Detail</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

function radialMetricOptions(percentage: number, color: string): ApexOptions {
  return {
    chart: {
      type: "radialBar",
      height: 81,
      width: 81,
      sparkline: { enabled: false },
    },
    series: [Math.max(0, Math.min(100, percentage))],
    plotOptions: {
      radialBar: {
        offsetY: 0,
        hollow: { margin: 0, size: "50%" },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 5,
            fontSize: "14px",
            fontWeight: "600",
            formatter: (value) => `${Math.round(value)}%`,
          },
        },
      },
    },
    grid: { padding: { top: -18, bottom: -20, left: -20, right: -20 } },
    colors: [color, "#F6F7FB"],
  };
}

function OverviewMetricCard({
  title,
  value,
  note,
  percentage,
  color = "#188ae2",
  variant = "primary",
  radial = false,
  onClick,
}: {
  title: string;
  value: string;
  note: string;
  percentage: number;
  color?: string;
  variant?: string;
  radial?: boolean;
  onClick?: () => void;
}) {
  const options = radialMetricOptions(percentage, color);
  return (
    <Card>
      <div className="d-flex card-header justify-content-between align-items-center">
        <h4 className="header-title">{title}</h4>
        <OverviewCardMenu onClick={onClick} />
      </div>
      <Card.Body className="pt-0">
        {radial ? (
          <div className="d-flex align-items-end gap-2 justify-content-between">
            <div className="text-end flex-shrink-0">
              <ReactApexChart
                height={81}
                width={81}
                options={options}
                series={options.series}
                type="radialBar"
              />
            </div>
            <div className="text-end">
              <h3 className="fw-semibold">{value}</h3>
              <p className="text-muted mb-0">{note}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center gap-2 justify-content-between">
              <span className={`badge bg-${variant} rounded-pill fs-13`}>
                {percentage.toFixed(1)}% <Icon icon="tabler:trending-up" />
              </span>
              <div className="text-end">
                <h3 className="fw-semibold">{value}</h3>
                <p className="text-muted mb-0">{note}</p>
              </div>
            </div>
            <ProgressBar
              variant={variant}
              className="progress-soft progress-sm mt-3"
              now={Math.max(0, Math.min(100, percentage))}
            />
          </>
        )}
      </Card.Body>
    </Card>
  );
}

function OverviewOrdersChart({ report }: { report: SalesReport }) {
  const methods = report.payment_methods.length
    ? report.payment_methods.slice(0, 4)
    : [{ label: "Belum ada", amount: 1, count: 0 }];
  const colors = ["#5b69bc", "#ff8acc", "#10c469", "#35b8e0"];
  const options: ApexOptions = {
    chart: { height: 281, type: "donut" },
    series: methods.map((item) => item.amount),
    labels: methods.map((item) => paymentLabels[item.label] || item.label),
    colors,
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      offsetY: 7,
    },
    stroke: { show: false },
  };
  return (
    <Card>
      <Card.Header className="border-bottom border-dashed">
        <h4 className="header-title">Statistik Pembayaran</h4>
      </Card.Header>
      <Card.Body className="pt-2">
        <div dir="ltr">
          <ReactApexChart
            height={281}
            options={options}
            className="apex-charts"
            series={options.series}
            type="donut"
          />
          <Row className="mt-3">
            {methods.map((item, index) => (
              <Col xs={6} key={item.label}>
                <div className="d-flex justify-content-between align-items-center p-1">
                  <div>
                    <Icon
                      icon="ri:circle-fill"
                      className="fs-12 align-middle me-1"
                      style={{ color: colors[index] }}
                    />
                    <span className="align-middle fw-semibold">
                      {paymentLabels[item.label] || item.label}
                    </span>
                  </div>
                  <span className="fw-semibold text-muted float-end">
                    {item.count}
                  </span>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}

function OverviewStatistics({ report }: { report: SalesReport }) {
  const dates = report.daily_sales.map((item) =>
    new Date(`${item.date}T00:00:00`).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    }),
  );
  const options: ApexOptions = {
    series: [
      {
        name: "Omzet",
        type: "bar",
        data: report.daily_sales.map((item) => item.total_sales),
      },
    ],
    chart: {
      height: 320,
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Public Sans, sans-serif",
      foreColor: "#475467",
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      bar: {
        columnWidth: dates.length > 20 ? "58%" : "48%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    grid: {
      borderColor: "#d7dee8",
      strokeDashArray: 3,
      padding: { left: 10, right: 12, bottom: 4 },
    },
    xaxis: {
      categories: dates,
      tickAmount: Math.min(7, Math.max(1, dates.length - 1)),
      axisBorder: { show: true, color: "#98a2b3" },
      axisTicks: { show: true, color: "#98a2b3" },
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        trim: false,
        style: {
          colors: "#475467",
          fontSize: "11px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      forceNiceScale: true,
      labels: {
        minWidth: 58,
        maxWidth: 64,
        formatter: formatCompactMoney,
        style: {
          colors: "#475467",
          fontSize: "11px",
          fontWeight: 500,
        },
      },
    },
    fill: { opacity: 1 },
    colors: ["#0969da"],
    tooltip: {
      theme: "light",
      y: { title: { formatter: () => "Omzet: " }, formatter: formatMoney },
    },
  };
  return (
    <Card className="overview-statistics-card">
      <div className="d-flex card-header justify-content-between align-items-center border-bottom border-dashed">
        <h4 className="header-title">Statistik</h4>
        <OverviewCardMenu />
      </div>
      <Card.Body className="p-0 pt-1">
        <div
          dir="ltr"
          className="px-2 pt-2"
          role="img"
          aria-label={`Grafik omzet harian untuk ${dates.length} hari`}
        >
          <ReactApexChart
            height={320}
            options={options}
            className="apex-charts"
            series={options.series}
            type="bar"
          />
        </div>
        <div className="border-top border-dashed mt-2">
          <Row className="text-center align-items-center g-0">
            <Col md={4} xs={6}>
              <p className="statistics-label mt-3 mb-1">Omzet</p>
              <h4 className="statistics-value mb-3">
                <span className="text-success me-1">
                  <Icon icon="ri:arrow-left-down-box-line" />
                </span>
                {formatMoney(report.total_sales)}
              </h4>
            </Col>
            <Col
              md={4}
              xs={6}
              className="border-start border-end border-dashed"
            >
              <p className="statistics-label mt-3 mb-1">Diskon</p>
              <h4 className="statistics-value mb-3">
                <span className="text-danger me-1">
                  <Icon icon="ri:arrow-left-up-box-line" />
                </span>
                {formatMoney(report.total_discount)}
              </h4>
            </Col>
            <Col md={4}>
              <p className="statistics-label mt-3 mb-1">Laba Kotor</p>
              <h4 className="statistics-value mb-3">
                <span className="text-success me-1">
                  <Icon icon="ri:arrow-left-down-box-line" />
                </span>
                {formatMoney(report.estimated_gross_profit)}
              </h4>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}

function OverviewRevenue({
  dashboard,
  report,
  salesStockShare,
}: {
  dashboard: AdminDashboard;
  report: SalesReport;
  salesStockShare: number;
}) {
  const grossRatio = report.total_sales
    ? report.estimated_gross_profit / report.total_sales
    : 0;
  const options: ApexOptions = {
    series: [
      {
        name: "Omzet",
        data: report.daily_sales.map((item) => item.total_sales),
      },
      {
        name: "Estimasi laba",
        data: report.daily_sales.map((item) => item.total_sales * grossRatio),
      },
    ],
    stroke: { width: 3, curve: "straight" },
    chart: {
      height: 299,
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: report.daily_sales.map((item) =>
        new Date(`${item.date}T00:00:00`).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
      ),
    },
    yaxis: {
      labels: { formatter: (value) => `${Math.round(value / 1000)} rb` },
    },
    colors: ["#10c469", "#35b8e0"],
    tooltip: { shared: true, y: { formatter: (value) => formatMoney(value) } },
  };
  return (
    <Card>
      <div className="d-flex card-header justify-content-between align-items-center border-bottom border-dashed">
        <h4 className="header-title">Total Pendapatan</h4>
        <OverviewCardMenu />
      </div>
      <Card.Body className="p-0 pt-1">
        <div dir="ltr" className="px-2">
          <ReactApexChart
            height={301}
            options={options}
            className="apex-charts"
            series={options.series}
            type="line"
          />
        </div>
        <div className="border-top border-dashed mt-2">
          <Row className="text-center align-items-center g-0">
            <Col md={4} xs={12}>
              <p className="text-muted mt-3 mb-1">Stok di Kasir</p>
              <h4 className="mb-3">{salesStockShare.toFixed(1)}%</h4>
            </Col>
            <Col
              md={4}
              xs={6}
              className="border-start border-end border-dashed"
            >
              <p className="text-muted mt-3 mb-1">Belanja Bulan Ini</p>
              <h4 className="mb-3">
                <span className="text-danger me-1">
                  <Icon icon="ri:arrow-left-up-box-line" />
                </span>
                {formatMoney(dashboard.purchase_spend_this_month)}
              </h4>
            </Col>
            <Col md={4}>
              <p className="text-muted mt-3 mb-1">Nilai Persediaan</p>
              <h4 className="mb-3">
                <span className="text-success me-1">
                  <Icon icon="ri:arrow-left-down-box-line" />
                </span>
                {formatMoney(dashboard.inventory_value)}
              </h4>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}

function OverviewSaleCards({
  sales,
  onOpenSales,
}: {
  sales: AdminSale[];
  onOpenSales: () => void;
}) {
  const avatars = [
    "/adminto/users/avatar-7.jpg",
    "/adminto/users/avatar-4.jpg",
    "/adminto/users/avatar-5.jpg",
    "/adminto/users/avatar-6.jpg",
    "/adminto/users/avatar-3.jpg",
  ];
  return (
    <Row className="row-cols-xxl-5 row-cols-md-2 row-cols-1">
      {sales.slice(0, 5).map((sale, index) => (
        <Col key={sale.id}>
          <Card>
            <Card.Body className="d-flex align-items-center gap-2">
              <Image
                src={avatars[index]}
                width={72}
                height={72}
                alt={sale.cashier_name}
                className="me-1 avatar-xl img-thumbnail rounded-circle"
              />
              <div>
                <h5>{sale.cashier_name}</h5>
                <p className="text-muted">
                  {sale.member_name || "Pelanggan umum"}
                </p>
                <p className="m-0 fs-14">
                  {sale.item_count} item{" "}
                  <button
                    type="button"
                    className="btn btn-link link-reset fw-medium p-0"
                    onClick={onOpenSales}
                  >
                    <Icon icon="tabler:arrow-right" />
                  </button>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

function OverviewPurchases({
  dashboard,
  onOpen,
}: {
  dashboard: AdminDashboard;
  onOpen: () => void;
}) {
  const orders = dashboard.recent_purchase_orders.slice(0, 5);
  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="header-title">Pembelian Terbaru</h4>
        <Button variant="light" size="sm" onClick={onOpen}>
          Tambah Pembelian <Icon icon="tabler:plus" className="ms-1" />
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="bg-light bg-opacity-50 py-1 text-center">
          <p className="m-0">
            <b>{dashboard.open_purchase_order_count}</b> pembelian aktif dari{" "}
            <span className="fw-medium">{orders.length}</span> data terbaru
          </p>
        </div>
        <div className="table-responsive">
          <table className="table table-custom table-centered table-sm table-nowrap table-hover mb-0">
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar-md flex-shrink-0 me-2">
                        <span className="avatar-title bg-primary-subtle rounded-circle">
                          <Icon
                            icon="solar:delivery-bold-duotone"
                            className="fs-22 text-primary"
                          />
                        </span>
                      </div>
                      <div>
                        <span className="text-muted fs-12">
                          {order.supplier.code}
                        </span>
                        <br />
                        <h5 className="fs-14 mt-1">{order.supplier.name}</h5>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-muted fs-12">Nomor</span>
                    <h5 className="fs-14 mt-1 fw-normal">{order.po_number}</h5>
                  </td>
                  <td>
                    <span className="text-muted fs-12">Produk</span>
                    <h5 className="fs-14 mt-1 fw-normal">
                      {orderQuantity(order)} unit
                    </h5>
                  </td>
                  <td>
                    <span className="text-muted fs-12">Total</span>
                    <h5 className="fs-14 mt-1 fw-normal">
                      {formatMoney(order.subtotal)}
                    </h5>
                  </td>
                  <td>
                    <span className="text-muted fs-12">Status</span>
                    <h5 className="fs-14 mt-1 fw-normal">
                      <StatusPill status={order.status} />
                    </h5>
                  </td>
                  <td style={{ width: 30 }}>
                    <OverviewCardMenu onClick={onOpen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders.length ? (
          <EmptyState
            icon="solar:clipboard-list-bold-duotone"
            title="Belum ada pembelian"
            copy="Catat pembelian pertama dari menu Pembelian."
          />
        ) : null}
      </Card.Body>
      <Card.Footer>
        <div className="align-items-center justify-content-between row text-center text-sm-start">
          <div className="col-sm">
            <div className="text-muted">
              Menampilkan <span className="fw-semibold">{orders.length}</span>{" "}
              pembelian terbaru
            </div>
          </div>
          <Col sm="auto" className="mt-3 mt-sm-0">
            <Button variant="link" size="sm" onClick={onOpen}>
              Lihat semua <Icon icon="tabler:chevron-right" />
            </Button>
          </Col>
        </div>
      </Card.Footer>
    </Card>
  );
}

function OverviewTopProducts({
  report,
  onOpen,
}: {
  report: SalesReport;
  onOpen: () => void;
}) {
  const products = report.top_products.slice(0, 5);
  return (
    <Card className="card-h-100">
      <Card.Header className="d-flex flex-wrap align-items-center gap-2 border-bottom border-dashed">
        <h4 className="header-title me-auto">Produk Terlaris</h4>
        <Button variant="light" size="sm" onClick={onOpen}>
          Laporan <Icon icon="tabler:download" className="ms-1" />
        </Button>
        <Button variant="primary" size="sm" onClick={onOpen}>
          Detail <Icon icon="tabler:file-export" className="ms-1" />
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <table className="table table-custom align-middle table-nowrap table-hover mb-0">
            <tbody>
              {products.map((product, index) => (
                <tr key={product.barcode}>
                  <td>
                    <div className="avatar-lg">
                      <Image
                        src={
                          templateProductImages[
                            index % templateProductImages.length
                          ]
                        }
                        width={64}
                        height={64}
                        alt={product.name}
                        className="img-fluid rounded-2"
                      />
                    </div>
                  </td>
                  <td className="ps-0">
                    <h5 className="fs-14 my-1">{product.name}</h5>
                    <span className="text-muted fs-12">{product.barcode}</span>
                  </td>
                  <td>
                    <h5 className="fs-14 my-1">
                      {formatMoney(
                        product.quantity
                          ? product.revenue / product.quantity
                          : 0,
                      )}
                    </h5>
                    <span className="text-muted fs-12">Harga rata-rata</span>
                  </td>
                  <td>
                    <h5 className="fs-14 my-1">{product.quantity}</h5>
                    <span className="text-muted fs-12">Jumlah</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center justify-content-end">
                      <div className="me-2">
                        <h5 className="fs-14 my-1">
                          {formatMoney(product.revenue)}
                        </h5>
                        <span className="text-muted fs-12">Omzet</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!products.length ? (
          <EmptyState
            icon="solar:cup-star-bold-duotone"
            title="Belum ada produk terjual"
            copy="Produk terlaris akan muncul setelah ada transaksi."
          />
        ) : null}
      </Card.Body>
      <Card.Footer>
        <div className="align-items-center justify-content-between row text-center text-sm-start">
          <div className="col-sm">
            <div className="text-muted">
              Menampilkan <span className="fw-semibold">{products.length}</span>{" "}
              produk teratas
            </div>
          </div>
          <Col sm="auto" className="mt-3 mt-sm-0">
            <ul className="pagination pagination-boxed pagination-sm mb-0 justify-content-center">
              <li className="page-item disabled">
                <span className="page-link">
                  <Icon icon="tabler:chevron-left" />
                </span>
              </li>
              <li className="page-item active">
                <span className="page-link">1</span>
              </li>
              <li className="page-item disabled">
                <span className="page-link">
                  <Icon icon="tabler:chevron-right" />
                </span>
              </li>
            </ul>
          </Col>
        </div>
      </Card.Footer>
    </Card>
  );
}

const liveStatusLabels: Record<LiveTransaction["status"], string> = {
  ready: "Siap melayani",
  shopping: "Pilih produk",
  payment: "Pembayaran",
  processing: "Memproses",
  completed: "Selesai",
  held: "Hold",
  cancelled: "Dibatalkan",
};

function liveStatusVariant(session: LiveTransaction) {
  if (
    !session.online &&
    !["completed", "held", "cancelled"].includes(session.status)
  )
    return "secondary";
  if (session.status === "ready" || session.status === "completed")
    return "success";
  if (session.status === "shopping") return "primary";
  if (session.status === "payment" || session.status === "processing")
    return "warning";
  if (session.status === "held") return "info";
  return "danger";
}

function heartbeatText(session: LiveTransaction, generatedAt: string) {
  const reference = generatedAt ? new Date(generatedAt).getTime() : Date.now();
  const seconds = Math.max(
    0,
    Math.floor((reference - new Date(session.last_seen_at).getTime()) / 1000),
  );
  if (seconds < 2) return "baru saja";
  if (seconds < 60) return `${seconds} detik lalu`;
  return `${Math.floor(seconds / 60)} menit lalu`;
}

function LiveTransactionsView({
  snapshot,
  connected,
}: {
  snapshot: LiveWorkflowSnapshot;
  connected: boolean;
}) {
  const terminalStatuses = new Set<LiveTransaction["status"]>([
    "completed",
    "held",
    "cancelled",
  ]);
  const activeSessions = snapshot.sessions.filter(
    (session) => !terminalStatuses.has(session.status),
  );
  const workstations = activeSessions.filter(
    (session, index, sessions) =>
      sessions.findIndex(
        (item) => item.cashier_code === session.cashier_code,
      ) === index,
  );
  const recentSessions = snapshot.sessions.filter((session) =>
    terminalStatuses.has(session.status),
  );
  const onlineCount = workstations.filter((session) => session.online).length;
  const readyCount = workstations.filter(
    (session) => session.service_ready,
  ).length;
  const running = workstations.filter(
    (session) => session.online && !session.service_ready,
  ).length;
  const liveValue = workstations.reduce(
    (total, session) => total + (session.online ? session.total : 0),
    0,
  );

  return (
    <>
      <Card className="mb-3">
        <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className="avatar-lg rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <Icon icon="solar:monitor-camera-bold-duotone" width={30} />
            </span>
            <div>
              <h4 className="mb-1">Workflow Transaksi Live</h4>
              <p className="text-muted mb-0">
                Pantau kesiapan kasir, isi keranjang, pembayaran, dan transaksi
                yang sedang diproses.
              </p>
            </div>
          </div>
          <Badge bg={connected ? "success" : "secondary"} className="px-3 py-2">
            <span
              className={`d-inline-block rounded-circle me-2 bg-${connected ? "white" : "light"}`}
              style={{ width: 8, height: 8 }}
            />
            {connected ? "Live terhubung" : "Menghubungkan live data"}
          </Badge>
        </Card.Body>
      </Card>

      <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1">
        <Col>
          <LiveSummaryCard
            icon="solar:monitor-smartphone-bold-duotone"
            color="primary"
            label="Kasir online"
            value={onlineCount}
            note={`${workstations.length} terminal terpantau`}
          />
        </Col>
        <Col>
          <LiveSummaryCard
            icon="solar:check-circle-bold-duotone"
            color="success"
            label="Siap melayani"
            value={readyCount}
            note="Menunggu pelanggan"
          />
        </Col>
        <Col>
          <LiveSummaryCard
            icon="solar:cart-check-bold-duotone"
            color="warning"
            label="Sedang transaksi"
            value={running}
            note="Keranjang atau pembayaran"
          />
        </Col>
        <Col>
          <LiveSummaryCard
            icon="solar:wallet-money-bold-duotone"
            color="info"
            label="Nilai keranjang live"
            value={formatMoney(liveValue)}
            note="Belum masuk omzet"
          />
        </Col>
      </Row>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h4 className="mb-1">Aktivitas kasir</h4>
          <p className="text-muted mb-0">
            Perubahan dari POS masuk otomatis setiap beberapa detik.
          </p>
        </div>
        {snapshot.generated_at ? (
          <small className="text-muted">
            Update {dateTimeFormatter.format(new Date(snapshot.generated_at))}
          </small>
        ) : null}
      </div>
      <Row className="g-3 mb-3">
        {workstations.map((session) => (
          <Col xxl={4} lg={6} key={session.id}>
            <LiveCashierCard
              session={session}
              generatedAt={snapshot.generated_at}
            />
          </Col>
        ))}
      </Row>
      {!workstations.length ? (
        <Card className="mb-3">
          <Card.Body>
            <EmptyState
              icon="solar:monitor-camera-bold-duotone"
              title="Belum ada kasir yang terhubung"
              copy="Buka halaman POS. Terminal akan muncul otomatis setelah heartbeat pertama diterima."
            />
          </Card.Body>
        </Card>
      ) : null}

      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-1">Aktivitas terbaru</h4>
            <p className="text-muted mb-0">
              Transaksi selesai, ditahan, atau dibatalkan dalam 15 menit
              terakhir.
            </p>
          </div>
          <Badge bg="light" text="dark">
            {recentSessions.length} aktivitas
          </Badge>
        </Card.Header>
        {recentSessions.length ? (
          <div className="table-responsive">
            <Table className="table-custom table-centered table-nowrap table-hover mb-0">
              <thead>
                <tr>
                  <th>Kasir</th>
                  <th>Transaksi</th>
                  <th>Status</th>
                  <th>Item</th>
                  <th>Metode</th>
                  <th className="text-end">Nilai</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td>
                      <strong className="d-block">
                        {session.cashier_name}
                      </strong>
                      <small className="text-muted">
                        {session.cashier_code}
                      </small>
                    </td>
                    <td>
                      <strong>
                        {session.transaction_no || "Belum tersimpan"}
                      </strong>
                    </td>
                    <td>
                      <Badge bg={liveStatusVariant(session)}>
                        {liveStatusLabels[session.status]}
                      </Badge>
                    </td>
                    <td>{numberFormatter.format(session.item_count)} item</td>
                    <td>
                      {session.payment_method
                        ? paymentLabels[session.payment_method]
                        : "—"}
                    </td>
                    <td className="text-end">
                      <strong>{formatMoney(session.total)}</strong>
                    </td>
                    <td>{heartbeatText(session, snapshot.generated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Card.Body>
            <EmptyState
              icon="solar:history-bold-duotone"
              title="Belum ada aktivitas terbaru"
              copy="Transaksi yang selesai, di-hold, atau dibatalkan akan tampil di sini."
            />
          </Card.Body>
        )}
      </Card>
    </>
  );
}

function LiveSummaryCard({
  icon,
  color,
  label,
  value,
  note,
}: {
  icon: string;
  color: string;
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <Card>
      <Card.Body className="d-flex align-items-center gap-3">
        <span
          className={`avatar-lg rounded bg-${color}-subtle text-${color} d-flex align-items-center justify-content-center`}
        >
          <Icon icon={icon} width={28} />
        </span>
        <div>
          <p className="text-muted mb-1">{label}</p>
          <h3 className="mb-1">{value}</h3>
          <small className="text-muted">{note}</small>
        </div>
      </Card.Body>
    </Card>
  );
}

function LiveCashierCard({
  session,
  generatedAt,
}: {
  session: LiveTransaction;
  generatedAt: string;
}) {
  const visibleStatus = session.online
    ? liveStatusLabels[session.status]
    : "Offline";
  const progress = session.online ? session.progress : 0;
  const progressVariant = liveStatusVariant(session);
  return (
    <Card className="h-100">
      <Card.Header className="d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="avatar-md rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold">
            {session.cashier_name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h5 className="mb-0">{session.cashier_name}</h5>
            <small className="text-muted">
              {session.cashier_code} · {session.store_name}
            </small>
          </div>
        </div>
        <Badge bg={progressVariant}>{visibleStatus}</Badge>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold">Progress transaksi</span>
          <strong>{progress}%</strong>
        </div>
        <ProgressBar
          now={progress}
          variant={progressVariant}
          className="progress-soft mb-3"
          animated={session.online && session.status === "processing"}
        />
        <div className="alert alert-light border d-flex align-items-center gap-2 py-2 mb-3">
          <Icon
            icon={
              session.service_ready
                ? "solar:check-circle-bold-duotone"
                : "solar:bolt-circle-bold-duotone"
            }
            width={20}
            className={session.service_ready ? "text-success" : "text-primary"}
          />
          <div>
            <small className="text-muted d-block">Aktivitas sekarang</small>
            <strong>
              {session.online
                ? session.current_action
                : "Terminal tidak mengirim heartbeat"}
            </strong>
          </div>
        </div>
        <Row className="g-2 text-center mb-3">
          <Col>
            <div className="border rounded p-2">
              <small className="text-muted d-block">Item</small>
              <strong>{session.item_count}</strong>
            </div>
          </Col>
          <Col>
            <div className="border rounded p-2">
              <small className="text-muted d-block">Produk</small>
              <strong>{session.unique_products}</strong>
            </div>
          </Col>
          <Col>
            <div className="border rounded p-2">
              <small className="text-muted d-block">Total</small>
              <strong>{formatMoney(session.total)}</strong>
            </div>
          </Col>
        </Row>
        {session.items.length ? (
          <div className="d-flex flex-column gap-2">
            {session.items.slice(0, 3).map((item) => (
              <div
                className="d-flex align-items-center gap-2"
                key={item.barcode}
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    width={36}
                    height={36}
                    alt={item.name}
                    className="rounded object-fit-contain bg-light"
                  />
                ) : (
                  <span className="avatar-sm rounded bg-light text-muted d-flex align-items-center justify-content-center">
                    <Icon icon="solar:box-minimalistic-linear" width={18} />
                  </span>
                )}
                <div className="flex-grow-1 overflow-hidden">
                  <strong className="d-block text-truncate fs-13">
                    {item.name}
                  </strong>
                  <small className="text-muted">
                    {item.quantity} × {formatMoney(item.unit_price)}
                  </small>
                </div>
                <strong className="fs-13">{formatMoney(item.subtotal)}</strong>
              </div>
            ))}
            {session.items.length > 3 ? (
              <small className="text-muted">
                +{session.items.length - 3} produk lainnya
              </small>
            ) : null}
          </div>
        ) : (
          <div className="text-center text-muted py-2">
            Keranjang kosong, kasir siap menerima pelanggan.
          </div>
        )}
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <span>
          <Icon icon="solar:user-heart-linear" width={16} className="me-1" />
          {session.member_name || "Pelanggan umum"}
        </span>
        <span className="text-muted">
          <Icon
            icon="solar:refresh-circle-linear"
            width={16}
            className="me-1"
          />
          {heartbeatText(session, generatedAt)}
        </span>
      </Card.Footer>
    </Card>
  );
}

function PanelHeader({
  icon,
  title,
  copy,
  action,
  onAction,
}: {
  icon: string;
  title: string;
  copy: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <Card.Header className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-2">
        <span className="avatar-sm rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
          <Icon icon={icon} width={20} />
        </span>
        <div>
          <h5 className="mb-0">{title}</h5>
          <small className="text-muted">{copy}</small>
        </div>
      </div>
      {action && onAction ? (
        <Button variant="link" size="sm" onClick={onAction}>
          {action} <Icon icon="solar:alt-arrow-right-linear" width={15} />
        </Button>
      ) : null}
    </Card.Header>
  );
}

function ProductMasterView({
  products,
  search,
  status,
  working,
  onSearch,
  onStatus,
  onAdd,
  onEdit,
  onDeactivate,
  onExport,
}: {
  products: MasterProduct[];
  search: string;
  status: string;
  working: boolean;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onAdd: () => void;
  onEdit: (product: MasterProduct) => void;
  onDeactivate: (product: MasterProduct) => void;
  onExport: () => void;
}) {
  return (
    <Card className="card-h-100">
      <Card.Header className="d-flex flex-wrap align-items-center gap-2 border-bottom border-dashed">
        <div className="me-auto">
          <h4 className="header-title mb-1">Master Produk</h4>
          <p className="text-muted mb-0">
            Kelola identitas, foto, harga, lokasi, dan status produk.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button variant="light" size="sm" onClick={onExport}>
            Ekspor <Icon icon="tabler:file-export" className="ms-1" />
          </Button>
          <Button size="sm" onClick={onAdd}>
            <Icon icon="tabler:plus" className="me-1" />
            Tambah produk
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="border-bottom">
        <Row className="g-2">
          <Col lg={8}>
            <InputGroup>
              <InputGroup.Text>
                <Icon icon="solar:magnifer-linear" width={17} />
              </InputGroup.Text>
              <Form.Control
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Cari nama, SKU, barcode, atau kategori"
              />
            </InputGroup>
          </Col>
          <Col lg={4}>
            <SearchableSelect
              value={status}
              onChange={(event) => onStatus(event.target.value)}
              aria-label="Filter status produk"
            >
              <option value="all">Semua status</option>
              <option value="active">Produk aktif</option>
              <option value="inactive">Produk nonaktif</option>
            </SearchableSelect>
          </Col>
        </Row>
      </Card.Body>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table className="table-custom align-middle table-nowrap table-hover mb-0">
            <thead>
              <tr>
                <th>Produk</th>
                <th>SKU / Barcode</th>
                <th>Harga</th>
                <th className="text-center">Stok</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.stock + product.warehouse_stock;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-lg bg-light rounded-2 d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="img-fluid object-fit-contain"
                            />
                          ) : (
                            <Icon
                              icon="solar:box-minimalistic-bold-duotone"
                              width={30}
                              className="text-muted"
                            />
                          )}
                        </div>
                        <div>
                          <h5 className="fs-14 my-1">{product.name}</h5>
                          <span className="text-muted fs-12">
                            {product.category} · {product.location}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1">
                        {product.sku || "Tanpa SKU"}
                      </h5>
                      <span className="text-muted fs-12">
                        {product.barcode}
                      </span>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1">
                        {formatMoney(product.price)}
                      </h5>
                      <span className="text-muted fs-12">
                        Modal {formatMoney(product.cost_price)}
                      </span>
                    </td>
                    <td className="text-center">
                      <h5 className="fs-14 my-1">
                        {numberFormatter.format(totalStock)}
                      </h5>
                      <span className="text-muted fs-12">
                        Kasir {product.stock} · Gudang {product.warehouse_stock}
                      </span>
                    </td>
                    <td>
                      <Badge bg={product.is_active ? "success" : "secondary"}>
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                      {totalStock <= product.reorder_level ? (
                        <Badge bg="warning" className="ms-1">
                          Stok rendah
                        </Badge>
                      ) : null}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="soft-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => onEdit(product)}
                        disabled={working}
                        title="Edit produk"
                      >
                        <Icon icon="solar:pen-new-square-linear" width={16} />
                      </Button>
                      {product.is_active ? (
                        <Button
                          variant="soft-danger"
                          size="sm"
                          onClick={() => onDeactivate(product)}
                          disabled={working}
                          title="Nonaktifkan produk"
                        >
                          <Icon
                            icon="solar:archive-down-minimlistic-linear"
                            width={16}
                          />
                        </Button>
                      ) : (
                        <Button
                          variant="soft-success"
                          size="sm"
                          onClick={() => onEdit(product)}
                          disabled={working}
                          title="Aktifkan lewat edit"
                        >
                          <Icon icon="solar:restart-bold" width={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
        {!products.length ? (
          <div className="p-4">
            <EmptyState
              icon="solar:box-minimalistic-bold-duotone"
              title="Produk tidak ditemukan"
              copy="Ubah pencarian atau tambahkan produk baru."
            />
          </div>
        ) : null}
      </Card.Body>
      <Card.Footer>
        <div className="align-items-center justify-content-between row text-center text-sm-start">
          <div className="col-sm">
            <div className="text-muted">
              Menampilkan <span className="fw-semibold">{products.length}</span>{" "}
              produk
            </div>
          </div>
          <Col sm="auto" className="mt-3 mt-sm-0">
            <ul className="pagination pagination-boxed pagination-sm mb-0 justify-content-center">
              <li className="page-item disabled">
                <button className="page-link" type="button">
                  <Icon icon="tabler:chevron-left" />
                </button>
              </li>
              <li className="page-item active">
                <button className="page-link" type="button">
                  1
                </button>
              </li>
              <li className="page-item disabled">
                <button className="page-link" type="button">
                  <Icon icon="tabler:chevron-right" />
                </button>
              </li>
            </ul>
          </Col>
        </div>
      </Card.Footer>
    </Card>
  );
}

function SalesView({
  sales,
  search,
  status,
  onSearch,
  onStatus,
}: {
  sales: AdminSale[];
  search: string;
  status: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
}) {
  return (
    <Card>
      <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h4 className="mb-1">Riwayat transaksi POS</h4>
          <p className="text-muted mb-0">
            Data pembayaran selesai, transaksi hold, dan transaksi dibatalkan.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <InputGroup>
            <InputGroup.Text>
              <Icon icon="solar:magnifer-linear" width={17} />
            </InputGroup.Text>
            <Form.Control
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Cari transaksi, kasir, atau produk"
            />
          </InputGroup>
          <SearchableSelect
            className="w-auto"
            value={status}
            onChange={(event) => onStatus(event.target.value)}
            aria-label="Filter status transaksi"
          >
            <option value="all">Semua status</option>
            <option value="completed">Selesai</option>
            <option value="held">Hold</option>
            <option value="cancelled">Dibatalkan</option>
          </SearchableSelect>
        </div>
      </Card.Header>
      <SalesTable sales={sales} />
      {!sales.length ? (
        <Card.Body>
          <EmptyState
            icon="solar:bill-list-bold-duotone"
            title="Transaksi tidak ditemukan"
            copy="Ubah kata kunci atau filter status untuk melihat transaksi lain."
          />
        </Card.Body>
      ) : null}
    </Card>
  );
}

function ReportsView({
  report,
  range,
  working,
  onRangeChange,
  onApply,
  onExport,
}: {
  report: SalesReport;
  range: { from: string; to: string };
  working: boolean;
  onRangeChange: (value: { from: string; to: string }) => void;
  onApply: (value?: { from: string; to: string }) => void;
  onExport: () => void;
}) {
  const [periodMode, setPeriodMode] = useState<"daily" | "monthly">("daily");
  const [reportProductSearch, setReportProductSearch] = useState("");
  const [reportTransactionSearch, setReportTransactionSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const reportPageSize = 25;
  const productQuery = reportProductSearch.trim().toLocaleLowerCase("id-ID");
  const transactionQuery = reportTransactionSearch
    .trim()
    .toLocaleLowerCase("id-ID");
  const filteredProductPerformance = report.product_performance.filter(
    (product) =>
      !productQuery ||
      [product.name, product.barcode, product.category].some((value) =>
        value.toLocaleLowerCase("id-ID").includes(productQuery),
      ),
  );
  const filteredReportTransactions = report.transactions.filter(
    (sale) =>
      !transactionQuery ||
      [
        sale.transaction_no,
        sale.cashier_name,
        sale.member_name || "",
        sale.payment_method || "",
        ...sale.items.flatMap((item) => [item.product_name, item.barcode]),
      ].some((value) =>
        value.toLocaleLowerCase("id-ID").includes(transactionQuery),
      ),
  );
  const productPageCount = Math.max(
    1,
    Math.ceil(filteredProductPerformance.length / reportPageSize),
  );
  const transactionPageCount = Math.max(
    1,
    Math.ceil(filteredReportTransactions.length / reportPageSize),
  );
  const currentProductPage = Math.min(productPage, productPageCount);
  const currentTransactionPage = Math.min(transactionPage, transactionPageCount);
  const visibleProductPerformance = filteredProductPerformance.slice(
    (currentProductPage - 1) * reportPageSize,
    currentProductPage * reportPageSize,
  );
  const visibleReportTransactions = filteredReportTransactions.slice(
    (currentTransactionPage - 1) * reportPageSize,
    currentTransactionPage * reportPageSize,
  );
  const localDateValue = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = new Date();
  const todayValue = localDateValue(today);
  const monthStartValue = localDateValue(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const metrics = [
    {
      label: "Total omzet",
      value: formatMoney(report.total_sales),
      icon: "solar:wallet-money-bold-duotone",
    },
    {
      label: "Transaksi",
      value: numberFormatter.format(report.transaction_count),
      icon: "solar:bill-list-bold-duotone",
    },
    {
      label: "Item terjual",
      value: numberFormatter.format(report.item_count),
      icon: "solar:cart-check-bold-duotone",
    },
    {
      label: "Rata-rata transaksi",
      value: formatMoney(report.average_transaction),
      icon: "solar:chart-2-bold-duotone",
    },
    {
      label: "Estimasi laba kotor",
      value: formatMoney(report.estimated_gross_profit),
      icon: "solar:graph-up-bold-duotone",
    },
    {
      label: "Diskon",
      value: formatMoney(report.total_discount),
      icon: "solar:tag-price-bold-duotone",
    },
  ];
  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col xl={4}>
              <div className="d-flex align-items-center gap-2">
                <span className="avatar-md rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
                  <Icon icon="solar:calendar-date-bold-duotone" width={24} />
                </span>
                <div>
                  <h5 className="mb-0">Periode laporan</h5>
                  <small className="text-muted">
                    Maksimal 366 hari per penarikan data.
                  </small>
                </div>
              </div>
            </Col>
            <Col md={3} xl={2}>
              <Form.Label>Dari</Form.Label>
              <Form.Control
                type="date"
                value={range.from}
                max={range.to}
                onChange={(event) =>
                  onRangeChange({ ...range, from: event.target.value })
                }
              />
            </Col>
            <Col md={3} xl={2}>
              <Form.Label>Sampai</Form.Label>
              <Form.Control
                type="date"
                value={range.to}
                min={range.from}
                onChange={(event) =>
                  onRangeChange({ ...range, to: event.target.value })
                }
              />
            </Col>
            <Col md={6} xl={4} className="d-flex flex-wrap gap-2">
              <Button
                variant="outline-secondary"
                disabled={working}
                onClick={() =>
                  onApply({ from: todayValue, to: todayValue })
                }
              >
                Hari ini
              </Button>
              <Button
                variant="outline-secondary"
                disabled={working}
                onClick={() =>
                  onApply({ from: monthStartValue, to: todayValue })
                }
              >
                Bulan ini
              </Button>
              <Button
                variant="outline-primary"
                disabled={working}
                onClick={() => onApply()}
              >
                {working ? (
                  <Spinner size="sm" className="me-1" />
                ) : (
                  <Icon
                    icon="solar:refresh-circle-linear"
                    width={17}
                    className="me-1"
                  />
                )}
                Terapkan
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => window.print()}
              >
                <Icon
                  icon="solar:printer-2-linear"
                  width={17}
                  className="me-1"
                />
                Cetak
              </Button>
              <Button onClick={onExport}>
                <Icon
                  icon="solar:download-minimalistic-linear"
                  width={17}
                  className="me-1"
                />
                Ekspor CSV
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row className="g-3 mb-3">
        {metrics.map((metric) => (
          <Col xxl={2} md={4} sm={6} key={metric.label}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center gap-2">
                  <span className="avatar-sm rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
                    <Icon icon={metric.icon} width={20} />
                  </span>
                  <div>
                    <small className="text-muted">{metric.label}</small>
                    <h5 className="mb-0">{metric.value}</h5>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className="g-3 mb-3">
        <Col xl={8}>
          <Card className="h-100">
            <PanelHeader
              icon="solar:chart-bold-duotone"
              title="Tren omzet"
              copy={`${formatDate(report.date_from)} sampai ${formatDate(report.date_to)}`}
            />
            <Card.Body>
              <SalesTrendChart data={report.daily_sales} />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4}>
          <Card className="h-100">
            <PanelHeader
              icon="solar:card-bold-duotone"
              title="Metode pembayaran"
              copy="Nilai dan jumlah transaksi."
            />
            <Card.Body>
              <BreakdownList
                items={report.payment_methods.map((item) => ({
                  ...item,
                  label: paymentLabels[item.label] || item.label,
                }))}
                empty="Belum ada pembayaran."
                unit="transaksi"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-3">
        <Col xl={6}>
          <Card className="h-100">
            <PanelHeader
              icon="solar:layers-bold-duotone"
              title="Penjualan kategori"
              copy="Kontribusi omzet per kategori."
            />
            <Card.Body>
              <BreakdownList
                items={report.category_sales}
                empty="Belum ada kategori terjual."
                unit="item"
              />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={6}>
          <Card className="h-100">
            <PanelHeader
              icon="solar:cup-star-bold-duotone"
              title="Produk terlaris"
              copy="Produk dengan unit penjualan tertinggi."
            />
            <Card.Body>
              <TopProducts products={report.top_products} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mt-3">
        <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h4 className="mb-1">Laporan transaksi per periode</h4>
            <p className="text-muted mb-0">
              Ringkasan omzet, laba, dan jumlah transaksi harian atau bulanan.
            </p>
          </div>
          <SearchableSelect
            className="w-auto"
            value={periodMode}
            onChange={(event) =>
              setPeriodMode(event.target.value as "daily" | "monthly")
            }
            aria-label="Kelompokkan laporan transaksi"
          >
            <option value="daily">Per hari</option>
            <option value="monthly">Per bulan</option>
          </SearchableSelect>
        </Card.Header>
        <div className="table-responsive">
          <Table className="table-custom table-centered mb-0">
            <thead>
              <tr>
                <th>Periode</th>
                <th className="text-end">Transaksi</th>
                <th className="text-end">Omzet</th>
                <th className="text-end">Laba kotor</th>
              </tr>
            </thead>
            <tbody>
              {(periodMode === "daily"
                ? report.daily_sales.map((item) => ({
                    period: formatDate(item.date),
                    ...item,
                  }))
                : report.monthly_sales.map((item) => ({
                    period: new Date(`${item.month}-01T00:00:00`).toLocaleDateString(
                      "id-ID",
                      { month: "long", year: "numeric" },
                    ),
                    ...item,
                  }))).map((item) => (
                <tr key={item.period}>
                  <td>
                    <strong>{item.period}</strong>
                  </td>
                  <td className="text-end">
                    {numberFormatter.format(item.transaction_count)}
                  </td>
                  <td className="text-end">{formatMoney(item.total_sales)}</td>
                  <td className="text-end text-success fw-semibold">
                    {formatMoney(item.gross_profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
      <Card className="mt-3">
        <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h4 className="mb-1">Keuntungan dan performa per produk</h4>
            <p className="text-muted mb-0">
              Omzet, HPP, laba, margin, dan jumlah transaksi dihitung langsung
              dari item penjualan.
            </p>
          </div>
          <InputGroup className="admin-report-search">
            <InputGroup.Text>
              <Icon icon="solar:magnifer-linear" width={17} />
            </InputGroup.Text>
            <Form.Control
              value={reportProductSearch}
              onChange={(event) => {
                setReportProductSearch(event.target.value);
                setProductPage(1);
              }}
              placeholder="Cari produk, barcode, atau kategori"
              aria-label="Cari performa produk"
            />
          </InputGroup>
        </Card.Header>
        <div className="table-responsive">
          <Table className="table-custom table-centered table-hover mb-0">
            <thead>
              <tr>
                <th>Produk</th>
                <th className="text-end">Transaksi</th>
                <th className="text-end">Unit</th>
                <th className="text-end">Omzet bersih</th>
                <th className="text-end">HPP</th>
                <th className="text-end">Laba kotor</th>
                <th className="text-end">Margin</th>
              </tr>
            </thead>
            <tbody>
              {visibleProductPerformance.map((product) => (
                <tr key={product.product_id}>
                  <td>
                    <strong className="d-block">{product.name}</strong>
                    <small className="text-muted">
                      {product.barcode} · {product.category}
                    </small>
                  </td>
                  <td className="text-end">
                    {numberFormatter.format(product.transaction_count)}
                  </td>
                  <td className="text-end">
                    {numberFormatter.format(product.quantity)}
                  </td>
                  <td className="text-end">{formatMoney(product.net_revenue)}</td>
                  <td className="text-end">{formatMoney(product.cost_of_goods)}</td>
                  <td className="text-end text-success fw-semibold">
                    {formatMoney(product.gross_profit)}
                  </td>
                  <td className="text-end">
                    {product.margin_percentage.toLocaleString("id-ID", {
                      maximumFractionDigits: 2,
                    })}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        {!filteredProductPerformance.length ? (
          <Card.Body className="text-center text-muted">
            Produk tidak ditemukan pada periode ini.
          </Card.Body>
        ) : (
          <ReportPagination
            page={currentProductPage}
            pageCount={productPageCount}
            itemCount={filteredProductPerformance.length}
            pageSize={reportPageSize}
            onPageChange={setProductPage}
          />
        )}
      </Card>
      <Card className="mt-3">
        <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h4 className="mb-1">Detail transaksi dan barang</h4>
            <p className="text-muted mb-0">
              Buka setiap transaksi untuk melihat produk, jumlah, harga, diskon,
              dan laba per barang.
            </p>
          </div>
          <InputGroup className="admin-report-search">
            <InputGroup.Text>
              <Icon icon="solar:magnifer-linear" width={17} />
            </InputGroup.Text>
            <Form.Control
              value={reportTransactionSearch}
              onChange={(event) => {
                setReportTransactionSearch(event.target.value);
                setTransactionPage(1);
              }}
              placeholder="Cari transaksi, kasir, atau produk"
              aria-label="Cari detail transaksi"
            />
          </InputGroup>
        </Card.Header>
        <SalesTable sales={visibleReportTransactions} />
        {!filteredReportTransactions.length ? (
          <Card.Body className="text-center text-muted">
            Transaksi tidak ditemukan pada periode ini.
          </Card.Body>
        ) : (
          <ReportPagination
            page={currentTransactionPage}
            pageCount={transactionPageCount}
            itemCount={filteredReportTransactions.length}
            pageSize={reportPageSize}
            onPageChange={setTransactionPage}
          />
        )}
      </Card>
    </>
  );
}

function ReportPagination({
  page,
  pageCount,
  itemCount,
  pageSize,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  itemCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, itemCount);
  return (
    <Card.Footer className="d-flex flex-wrap align-items-center justify-content-between gap-2">
      <small className="text-muted">
        Menampilkan {numberFormatter.format(firstItem)}–
        {numberFormatter.format(lastItem)} dari {numberFormatter.format(itemCount)} data
      </small>
      <div className="d-flex align-items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </Button>
        <small className="text-muted">
          Halaman {numberFormatter.format(page)} dari {numberFormatter.format(pageCount)}
        </small>
        <Button
          type="button"
          size="sm"
          variant="outline-secondary"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </Card.Footer>
  );
}

function SalesTrendChart({ data }: { data: SalesReport["daily_sales"] }) {
  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
    },
    colors: ["#3e60d5", "#0f9f78"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.04,
        stops: [0, 95, 100],
      },
    },
    grid: { borderColor: "#e9ecef", strokeDashArray: 4 },
    xaxis: {
      categories: data.map((item) =>
        new Date(`${item.date}T00:00:00`).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        }),
      ),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (value) =>
          value >= 1_000_000
            ? `${(value / 1_000_000).toFixed(1)} jt`
            : `${Math.round(value / 1000)} rb`,
      },
    },
    tooltip: { y: { formatter: (value) => formatMoney(value) } },
  };
  return (
    <ReactApexChart
      options={options}
      series={[
        { name: "Omzet", data: data.map((item) => item.total_sales) },
        { name: "Laba kotor", data: data.map((item) => item.gross_profit) },
      ]}
      type="area"
      height={310}
    />
  );
}

function BreakdownList({
  items,
  empty,
  unit,
}: {
  items: Array<{ label: string; amount: number; count: number }>;
  empty: string;
  unit: string;
}) {
  const max = Math.max(...items.map((item) => item.amount), 1);
  if (!items.length)
    return <p className="text-muted text-center py-4 mb-0">{empty}</p>;
  return (
    <div>
      {items.slice(0, 7).map((item) => (
        <div className="mb-3" key={item.label}>
          <div className="d-flex justify-content-between mb-1">
            <strong>{item.label}</strong>
            <span>{formatMoney(item.amount)}</span>
          </div>
          <ProgressBar now={Math.max(5, (item.amount / max) * 100)} />
          <small className="text-muted">
            {numberFormatter.format(item.count)} {unit}
          </small>
        </div>
      ))}
    </div>
  );
}

function TopProducts({ products }: { products: SalesReport["top_products"] }) {
  if (!products.length)
    return (
      <p className="text-muted text-center py-4 mb-0">
        Belum ada produk terjual pada periode ini.
      </p>
    );
  return (
    <div>
      {products.map((product, index) => (
        <div
          className="d-flex align-items-center py-2 border-bottom"
          key={product.barcode}
        >
          <Badge bg="primary" className="me-2">
            {index + 1}
          </Badge>
          <div className="flex-grow-1">
            <h6 className="mb-0">{product.name}</h6>
            <small className="text-muted">{product.barcode}</small>
          </div>
          <div className="text-end">
            <strong className="d-block">
              {numberFormatter.format(product.quantity)} unit
            </strong>
            <small className="text-muted d-block">
              Omzet {formatMoney(product.revenue)}
            </small>
            <small className="text-success">
              Laba {formatMoney(product.gross_profit)} ·{" "}
              {product.margin_percentage.toLocaleString("id-ID", {
                maximumFractionDigits: 2,
              })}
              %
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}

function SalesTable({
  sales,
  compact = false,
}: {
  sales: AdminSale[];
  compact?: boolean;
}) {
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
  if (!sales.length) return null;
  const toggleSale = (saleId: string) => {
    setExpandedSales((current) => {
      const next = new Set(current);
      if (next.has(saleId)) next.delete(saleId);
      else next.add(saleId);
      return next;
    });
  };
  return (
    <div className="table-responsive">
      <Table className="table-custom table-centered table-nowrap table-hover mb-0">
        <thead>
          <tr>
            <th>Transaksi</th>
            <th>Waktu</th>
            <th>Kasir / pelanggan</th>
            <th>Bayar</th>
            <th className="text-center">Item</th>
            <th>Status</th>
            {!compact ? <th className="text-end">Laba</th> : null}
            <th className="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const expanded = expandedSales.has(sale.id);
            return (
              <Fragment key={sale.id}>
                <tr>
                  <td>
                    <strong className="d-block">{sale.transaction_no}</strong>
                    {!compact ? (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none"
                        onClick={() => toggleSale(sale.id)}
                        aria-expanded={expanded}
                      >
                        <Icon
                          icon={
                            expanded
                              ? "solar:alt-arrow-up-linear"
                              : "solar:alt-arrow-down-linear"
                          }
                          width={14}
                          className="me-1"
                        />
                        {expanded ? "Tutup barang" : "Lihat barang"}
                      </button>
                    ) : null}
                  </td>
                  <td>{dateTimeFormatter.format(new Date(sale.created_at))}</td>
                  <td>
                    <strong className="d-block">{sale.cashier_name}</strong>
                    <small className="text-muted">
                      {sale.member_name || "Pelanggan umum"}
                    </small>
                  </td>
                  <td>
                    {sale.payment_method
                      ? paymentLabels[sale.payment_method] || sale.payment_method
                      : "—"}
                  </td>
                  <td className="text-center">{sale.item_count}</td>
                  <td>
                    <Badge
                      bg={
                        sale.status === "completed"
                          ? "success"
                          : sale.status === "held"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {sale.status === "completed"
                        ? "Selesai"
                        : sale.status === "held"
                          ? "Hold"
                          : "Dibatalkan"}
                    </Badge>
                  </td>
                  {!compact ? (
                    <td className="text-end text-success fw-semibold">
                      {formatMoney(sale.gross_profit)}
                    </td>
                  ) : null}
                  <td className="text-end">
                    <strong className="d-block">{formatMoney(sale.total)}</strong>
                    {!compact && sale.discount > 0 ? (
                      <small className="text-muted">
                        Diskon {formatMoney(sale.discount)}
                      </small>
                    ) : null}
                  </td>
                </tr>
                {!compact && expanded ? (
                  <tr className="sale-items-detail-row">
                    <td colSpan={8}>
                      <div className="sale-items-detail">
                        <Table size="sm" className="mb-0 align-middle">
                          <thead>
                            <tr>
                              <th>Barang</th>
                              <th className="text-end">Harga</th>
                              <th className="text-end">Qty</th>
                              <th className="text-end">Diskon</th>
                              <th className="text-end">Subtotal</th>
                              <th className="text-end">Laba</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.items.map((item) => (
                              <tr key={`${sale.id}-${item.product_id}`}>
                                <td>
                                  <strong className="d-block">
                                    {item.product_name}
                                  </strong>
                                  <small className="text-muted">{item.barcode}</small>
                                </td>
                                <td className="text-end">
                                  {formatMoney(item.unit_price)}
                                </td>
                                <td className="text-end">{item.quantity}</td>
                                <td className="text-end">
                                  {formatMoney(item.discount)}
                                </td>
                                <td className="text-end">
                                  {formatMoney(item.subtotal)}
                                </td>
                                <td className="text-end text-success fw-semibold">
                                  {formatMoney(item.gross_profit)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

function PurchasingView({
  orders,
  onCreateOrder,
}: {
  orders: PurchaseOrder[];
  onCreateOrder: () => void;
}) {
  return (
    <Card>
      <Card.Header className="d-flex align-items-center justify-content-between gap-3">
        <div>
          <h4 className="mb-1">Riwayat pembelian</h4>
          <p className="text-muted mb-0">
            Pembelian yang dicatat langsung menambah stok gudang.
          </p>
        </div>
        <Button onClick={onCreateOrder}>
          <Icon icon="solar:add-circle-linear" width={17} className="me-1" />
          Catat pembelian
        </Button>
      </Card.Header>
      {orders.length ? (
        <div className="table-responsive">
          <Table className="table-custom table-centered table-nowrap table-hover mb-0">
            <thead>
              <tr>
                <th>Nomor pembelian</th>
                <th>Supplier</th>
                <th>Barang masuk</th>
                <th>Tanggal beli</th>
                <th>Status</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong className="d-block">{order.po_number}</strong>
                    <small className="text-muted">
                      {dateFormatter.format(new Date(order.created_at))}
                    </small>
                  </td>
                  <td>
                    <strong className="d-block">{order.supplier.name}</strong>
                    <small className="text-muted">{order.supplier.code}</small>
                  </td>
                  <td>
                    <strong className="d-block">
                      {orderQuantity(order)} unit
                    </strong>
                    <small className="text-muted">
                      {order.items.length} macam produk
                    </small>
                  </td>
                  <td>{formatDate(order.expected_date)}</td>
                  <td>
                    <StatusPill status={order.status} />
                  </td>
                  <td className="text-end">
                    <strong>{formatMoney(order.subtotal)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <Card.Body>
          <EmptyState
            icon="solar:cart-large-2-bold-duotone"
            title="Belum ada pembelian"
            copy="Gunakan tombol Catat pembelian untuk merekam barang masuk gudang."
          />
        </Card.Body>
      )}
    </Card>
  );
}

function StockView({
  stock,
  search,
  onSearch,
  onAdjust,
  onTransfer,
  onCreateOrder,
}: {
  stock: StockItem[];
  search: string;
  onSearch: (value: string) => void;
  onAdjust: (product?: StockItem) => void;
  onTransfer: (product?: StockItem) => void;
  onCreateOrder?: () => void;
}) {
  return (
    <Card>
      <Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h4 className="mb-1">Persediaan produk</h4>
          <p className="text-muted mb-0">
            Saldo gudang dan stok yang tersedia untuk transaksi kasir.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <InputGroup>
            <InputGroup.Text>
              <Icon icon="solar:magnifer-linear" width={17} />
            </InputGroup.Text>
            <Form.Control
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Cari produk atau barcode"
            />
          </InputGroup>
          <Button variant="outline-secondary" onClick={() => onTransfer()}>
            <Icon
              icon="solar:transfer-horizontal-linear"
              width={17}
              className="me-1"
            />
            Transfer
          </Button>
          <Button variant="outline-secondary" onClick={() => onAdjust()}>
            <Icon
              icon="solar:settings-minimalistic-linear"
              width={17}
              className="me-1"
            />
            Koreksi
          </Button>
          {onCreateOrder ? (
            <Button onClick={onCreateOrder}>
              <Icon
                icon="solar:box-minimalistic-linear"
                width={17}
                className="me-1"
              />
              Beli stok
            </Button>
          ) : null}
        </div>
      </Card.Header>
      <div className="table-responsive">
        <Table className="table-custom table-centered table-nowrap table-hover mb-0">
          <thead>
            <tr>
              <th>Produk</th>
              <th className="text-end">Harga pokok</th>
              <th className="text-end">Harga jual</th>
              <th className="text-center">Gudang</th>
              <th className="text-center">Kasir</th>
              <th className="text-center">Total</th>
              <th>Status kasir</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((product) => (
              <tr key={product.id}>
                <td>
                  <strong className="d-block">{product.name}</strong>
                  <small className="text-muted">
                    {product.barcode} · {product.category}
                  </small>
                </td>
                <td className="text-end">{formatMoney(product.cost_price)}</td>
                <td className="text-end">
                  <strong>{formatMoney(product.price)}</strong>
                </td>
                <td className="text-center">{product.warehouse_stock}</td>
                <td className="text-center">
                  <strong
                    className={
                      product.stock_status !== "healthy" ? "text-danger" : ""
                    }
                  >
                    {product.sales_stock}
                  </strong>
                </td>
                <td className="text-center">
                  <strong>{product.total_stock}</strong>
                </td>
                <td>
                  <Badge
                    bg={
                      product.stock_status === "healthy"
                        ? "success"
                        : product.stock_status === "low"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {product.stock_status === "healthy"
                      ? "Aman"
                      : product.stock_status === "low"
                        ? "Menipis"
                        : "Habis"}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="soft-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => onTransfer(product)}
                    title="Transfer"
                  >
                    <Icon icon="solar:transfer-horizontal-linear" width={16} />
                  </Button>
                  <Button
                    variant="soft-secondary"
                    size="sm"
                    onClick={() => onAdjust(product)}
                    title="Sesuaikan"
                  >
                    <Icon
                      icon="solar:settings-minimalistic-linear"
                      width={16}
                    />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {!stock.length ? (
        <Card.Body>
          <EmptyState
            icon="solar:magnifer-linear"
            title="Produk tidak ditemukan"
            copy="Coba kata kunci atau barcode yang berbeda."
          />
        </Card.Body>
      ) : null}
    </Card>
  );
}

function AccessView({
  roles,
  staff,
  working,
  onSaveRole,
  onAssignRole,
}: {
  roles: AccessRole[];
  staff: StaffMember[];
  working: boolean;
  onSaveRole: (role: AccessRole, permissions: string[]) => void;
  onAssignRole: (staffId: string, roleId: string) => void;
}) {
  return (
    <>
      <Card className="mb-3">
        <Card.Header>
          <h4 className="mb-1">Role dan akses halaman</h4>
          <p className="text-muted mb-0">
            Atur halaman yang dapat dibuka oleh setiap role.
          </p>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            {roles.map((role) => (
              <Col
                xl={4}
                md={6}
                key={`${role.id}:${role.permissions.join(",")}`}
              >
                <RoleCard role={role} working={working} onSave={onSaveRole} />
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
      <Card>
        <Card.Header>
          <h4 className="mb-1">Role petugas</h4>
          <p className="text-muted mb-0">
            Hubungkan setiap petugas dengan satu role operasional.
          </p>
        </Card.Header>
        <div className="table-responsive">
          <Table className="table-custom table-centered table-nowrap table-hover mb-0">
            <thead>
              <tr>
                <th>Petugas</th>
                <th>Kode</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>{member.full_name}</strong>
                  </td>
                  <td>{member.employee_code}</td>
                  <td>
                    <Badge bg={member.is_active ? "success" : "danger"}>
                      {member.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td>
                    <SearchableSelect
                      value={member.role_id || ""}
                      disabled={working}
                      onChange={(event) =>
                        onAssignRole(member.id, event.target.value)
                      }
                    >
                      <option value="" disabled>
                        Pilih role
                      </option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </SearchableSelect>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </>
  );
}

function RoleCard({
  role,
  working,
  onSave,
}: {
  role: AccessRole;
  working: boolean;
  onSave: (role: AccessRole, permissions: string[]) => void;
}) {
  const [selected, setSelected] = useState(role.permissions);
  const locked = role.code === "OWNER";
  function toggle(permission: string) {
    setSelected((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  }
  return (
    <Card className="h-100 border">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="avatar-sm rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold">
            {role.code.slice(0, 2)}
          </span>
          <div>
            <h5 className="mb-0">{role.name}</h5>
            <small className="text-muted">{role.code}</small>
          </div>
        </div>
        {locked ? <Badge bg="primary">Role utama</Badge> : null}
      </Card.Header>
      <Card.Body>
        {Object.entries(permissionLabels).map(([permission, label]) => (
          <Form.Check
            className="mb-2"
            key={permission}
            type="checkbox"
            label={label}
            checked={selected.includes(permission)}
            disabled={locked || working}
            onChange={() => toggle(permission)}
          />
        ))}
      </Card.Body>
      <Card.Footer className="d-flex align-items-center justify-content-between">
        <span className="text-muted">{selected.length} akses aktif</span>
        <Button
          variant="outline-primary"
          size="sm"
          disabled={locked || working || selected.length === 0}
          onClick={() => onSave(role, selected)}
        >
          {working ? (
            <Spinner size="sm" className="me-1" />
          ) : (
            <Icon icon="solar:diskette-linear" width={16} className="me-1" />
          )}
          Simpan
        </Button>
      </Card.Footer>
    </Card>
  );
}

function SuppliersView({
  suppliers,
  onAdd,
}: {
  suppliers: Supplier[];
  onAdd: () => void;
}) {
  return (
    <>
      <Card className="mb-3">
        <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className="avatar-lg rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
              <Icon icon="solar:delivery-bold-duotone" width={30} />
            </span>
            <div>
              <h4 className="mb-1">Mitra pemasok MYMARKET</h4>
              <p className="text-muted mb-0">
                Simpan identitas dan kontak supplier untuk pencatatan pembelian
                stok.
              </p>
            </div>
          </div>
          <Button onClick={onAdd}>
            <Icon icon="solar:add-circle-linear" width={17} className="me-1" />
            Tambah supplier
          </Button>
        </Card.Body>
      </Card>
      <Row className="g-3">
        {suppliers.map((supplier) => (
          <Col xl={4} md={6} key={supplier.id}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="avatar-lg rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold">
                    {supplier.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <Badge bg="light" text="dark">
                      {supplier.code}
                    </Badge>
                    <h5 className="mt-1 mb-0">{supplier.name}</h5>
                  </div>
                </div>
                <dl className="mb-0">
                  <dt className="text-muted fw-normal">
                    <Icon
                      icon="solar:user-rounded-linear"
                      width={16}
                      className="me-1"
                    />
                    Kontak
                  </dt>
                  <dd>{supplier.contact_person || "Belum diisi"}</dd>
                  <dt className="text-muted fw-normal">
                    <Icon
                      icon="solar:phone-linear"
                      width={16}
                      className="me-1"
                    />
                    Telepon
                  </dt>
                  <dd>{supplier.phone || "Belum diisi"}</dd>
                  <dt className="text-muted fw-normal">
                    <Icon
                      icon="solar:letter-linear"
                      width={16}
                      className="me-1"
                    />
                    Email
                  </dt>
                  <dd>{supplier.email || "Belum diisi"}</dd>
                  {supplier.address ? (
                    <>
                      <dt className="text-muted fw-normal">
                        <Icon
                          icon="solar:map-point-linear"
                          width={16}
                          className="me-1"
                        />
                        Alamat
                      </dt>
                      <dd>{supplier.address}</dd>
                    </>
                  ) : null}
                </dl>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Badge bg="success">Aktif</Badge>
                <small className="text-muted">
                  Ditambahkan{" "}
                  {dateFormatter.format(new Date(supplier.created_at))}
                </small>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
      {!suppliers.length ? (
        <Card>
          <Card.Body>
            <EmptyState
              icon="solar:buildings-2-bold-duotone"
              title="Belum ada supplier"
              copy="Gunakan tombol Tambah supplier di atas untuk mulai mencatat pemasok."
            />
          </Card.Body>
        </Card>
      ) : null}
    </>
  );
}

function EmptyState({
  icon,
  title,
  copy,
}: {
  icon: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="text-center py-4">
      <span className="avatar-lg rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2">
        <Icon icon={icon} width={28} />
      </span>
      <h5>{title}</h5>
      <p className="text-muted mb-0">{copy}</p>
    </div>
  );
}
