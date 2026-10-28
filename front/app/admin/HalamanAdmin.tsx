"use client";

// Halaman utama admin: memilih menu sidebar dan memuat data untuk setiap modul.

import { Icon } from "@iconify/react";
import Image from "next/image";
import {
  FormEvent,
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
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";

import KerangkaAdmin from "./KerangkaAdmin";
import AnalisisProduk from "./AnalisisProduk";
import MasterProduk from "./MasterProduk";
import RingkasanAdmin from "./RingkasanAdmin";
import PengaturanAkses from "./PengaturanAkses";
import TransaksiLangsung from "./TransaksiLangsung";
import { DaftarPembelian, PersediaanStok, DaftarPemasok } from "./StokDanPembelian";
import { gambarProdukContoh } from "./gambarProdukContoh";
import FiturOperasionalAdmin, { type TabOperasional } from "./FiturOperasionalAdmin";
import { LaporanBisnis, RiwayatPenjualan } from "./PenjualanDanLaporan";

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
  type LiveWorkflowSnapshot,
  type ProductPayload,
  type PurchaseOrder,
  type SalesReport,
  type StockItem,
  type StaffMember,
  type Supplier,
} from "../api";
import PilihanCari from "../PilihanCari";

type MenuAdmin =
  | "overview"
  | "live"
  | "cashier"
  | "products"
  | "sales"
  | "product-analysis"
  | "reports"
  | "stock"
  | "purchasing"
  | "customers"
  | "finance"
  | "settings"
  | "access";
type NamaDialog =
  "product" | "purchase" | "supplier" | "adjustment" | "transfer" | null;
type BarisPembelian = {
  key: string;
  barcode: string;
  quantity: number;
  unitCost: number;
};
type FormProduk = ProductPayload;

const moneyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const daftarMenu: Array<{
  id: MenuAdmin;
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
    permission: "admin.live_transactions",
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
    id: "product-analysis",
    label: "Analisis Produk",
    icon: "solar:chart-square-bold-duotone",
    permission: "admin.reports",
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
    permission: "admin.sales",
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

const menuOperasional: Partial<Record<MenuAdmin, TabOperasional>> = {
  cashier: "cashier",
  products: "catalog",
  stock: "inventory",
  purchasing: "purchasing",
  customers: "customers",
  finance: "finance",
  reports: "reports",
  settings: "settings",
};

const formProdukKosong: FormProduk = {
  barcode: "",
  sku: "",
  name: "",
  category: "",
  brand: "",
  unit: "pcs",
  unit_conversion: 1,
  location: "",
  image_url: gambarProdukContoh[0],
  price: 0,
  cost_price: 0,
  reorder_level: 3,
  is_active: true,
};

function rentangLaporanAwal() {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - 29);
  return {
    from: dateFrom.toISOString().slice(0, 10),
    to: dateTo.toISOString().slice(0, 10),
  };
}

function rentangBulan(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` };
}

function formatRupiah(value: number) {
  return moneyFormatter.format(value).replace(/\s/g, "");
}

export default function HalamanAdmin() {
  // `view` menentukan menu sidebar yang aktif. Data semua modul disimpan di sini
  // lalu dikirim ke komponen menu (MasterProduk, LaporanBisnis, dan lainnya).
  const [view, setView] = useState<MenuAdmin>("overview");
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
  const [modal, setModal] = useState<NamaDialog>(null);
  const [stockSearch, setStockSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productStatus, setProductStatus] = useState("all");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] =
    useState<FormProduk>(formProdukKosong);
  const [salesSearch, setSalesSearch] = useState("");
  const [salesStatus, setSalesStatus] = useState("all");
  const [salesPayment, setSalesPayment] = useState("all");
  const [salesMonth, setSalesMonth] = useState("");
  const [salesPage, setSalesPage] = useState(1);
  const [salesLoading, setSalesLoading] = useState(false);
  const [reportRange, setReportRange] = useState(rentangLaporanAwal);
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
  const [purchaseLines, setPurchaseLines] = useState<BarisPembelian[]>([
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

  // Ambil hak akses lebih dulu. Hanya data modul yang diizinkan yang diminta.
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
      // Request yang bebas satu sama lain dijalankan bersamaan supaya halaman cepat siap.
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
      // Jika role berubah, pindahkan pengguna ke menu pertama yang boleh dibuka.
      const allowedViews = daftarMenu.filter((item) => can(item.permission));
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

  // Tema admin ditempel saat halaman dibuka dan dikembalikan saat halaman ditutup.
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

  // Muat data awal satu kali setelah komponen dipasang.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void refreshData());
    return () => window.cancelAnimationFrame(frame);
  }, [refreshData]);

  // Filter penjualan dikirim ke backend. Pencarian ditunda 250 ms saat mengetik.
  useEffect(() => {
    if (!access?.permissions.includes("admin.sales")) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSalesLoading(true);
      try {
        const period = salesMonth ? rentangBulan(salesMonth) : null;
        const rows = await loadAdminSales({
          dateFrom: period?.from,
          dateTo: period?.to,
          status: salesStatus,
          paymentMethod: salesPayment,
          search: salesSearch,
          limit: 100,
          offset: (salesPage - 1) * 100,
        });
        if (!cancelled) setSales(rows);
      } catch (caught) {
        if (!cancelled)
          setError(caught instanceof Error ? caught.message : "Penjualan gagal dimuat");
      } finally {
        if (!cancelled) setSalesLoading(false);
      }
    }, salesSearch ? 250 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [access, salesSearch, salesStatus, salesPayment, salesMonth, salesPage]);

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

  const visibleNavigation = useMemo(
    () =>
      access
        ? daftarMenu.filter((item) =>
            access.permissions.includes(item.permission),
          )
        : daftarMenu,
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
  const operationsTab = menuOperasional[view];

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
        image_url: product.image_url || gambarProdukContoh[0],
        price: product.price,
        cost_price: product.cost_price,
        reorder_level: product.reorder_level,
        is_active: product.is_active,
      });
    } else {
      setEditingProductId(null);
      setProductForm({ ...formProdukKosong });
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

  function openView(nextView: MenuAdmin) {
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

  async function exportReport() {
    if (!report) return;
    setWorking(true);
    setError("");
    try {
    const allTransactions: AdminSale[] = [];
    for (let offset = 0; ; offset += 500) {
      const batch = await loadAdminSales({
        dateFrom: report.date_from,
        dateTo: report.date_to,
        status: "completed",
        limit: 500,
        offset,
      });
      allTransactions.push(...batch);
      if (batch.length < 500) break;
    }
    const escapeCsv = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ["RINGKASAN LABA RUGI"],
      ["Periode awal", report.date_from],
      ["Periode akhir", report.date_to],
      ["Omzet transaksi", report.total_sales],
      ["Omzet bersih item", report.product_performance.reduce((sum, product) => sum + product.net_revenue, 0)],
      ["HPP barang terjual", report.cost_of_goods],
      ["Laba kotor", report.estimated_gross_profit],
      ["Pengeluaran operasional", report.expenses],
      ["Laba / rugi operasional", report.net_profit],
      [],
      ["RINGKASAN HARIAN"],
      ["Tanggal", "Transaksi", "Omzet", "Laba Kotor", "Pengeluaran", "Laba/Rugi Operasional"],
      ...report.daily_sales.map((item) => [
        item.date,
        item.transaction_count,
        item.total_sales,
        item.gross_profit,
        item.expenses,
        item.net_profit,
      ]),
      [],
      ["RINGKASAN BULANAN"],
      ["Bulan", "Transaksi", "Omzet", "Laba Kotor", "Pengeluaran", "Laba/Rugi Operasional"],
      ...report.monthly_sales.map((item) => [
        item.month, item.transaction_count, item.total_sales,
        item.gross_profit, item.expenses, item.net_profit,
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
      ...allTransactions.flatMap((sale) =>
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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ekspor laporan gagal");
    } finally {
      setWorking(false);
    }
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

  function updatePurchaseLine(key: string, update: Partial<BarisPembelian>) {
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
    <KerangkaAdmin
      title={currentTitle}
      navigation={visibleNavigation}
      activeView={view}
      fullName={access?.full_name}
      roleName={access?.role_name}
      employeeCode={access?.employee_code}
      lowStockCount={dashboard?.low_stock_count}
      showCeoCopilot={access?.permissions.includes("admin.ceo_chat")}
      showPos={access?.permissions.includes("pos.access")}
      onView={(nextView) => openView(nextView as MenuAdmin)}
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
        <RingkasanAdmin
          dashboard={dashboard}
          report={report}
          onOpenPurchasing={() => openView("purchasing")}
          onOpenStock={() => openView("stock")}
          onOpenSales={() => openView("sales")}
          onOpenReports={() => openView("reports")}
        />
      ) : null}
      {!loading && view === "live" ? (
        <TransaksiLangsung
          snapshot={liveWorkflow}
          connected={liveConnected}
        />
      ) : null}
      {!loading && view === "products" ? (
        <MasterProduk
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
        <RiwayatPenjualan
          sales={sales}
          search={salesSearch}
          status={salesStatus}
          payment={salesPayment}
          month={salesMonth}
          page={salesPage}
          loading={salesLoading}
          onSearch={(value) => { setSalesSearch(value); setSalesPage(1); }}
          onStatus={(value) => { setSalesStatus(value); setSalesPage(1); }}
          onPayment={(value) => { setSalesPayment(value); setSalesPage(1); }}
          onMonth={(value) => { setSalesMonth(value); setSalesPage(1); }}
          onPage={setSalesPage}
        />
      ) : null}
      {!loading && view === "product-analysis" ? (
        <AnalisisProduk />
      ) : null}
      {!loading && view === "reports" && report ? (
        <LaporanBisnis
          report={report}
          range={reportRange}
          working={working}
          onRangeChange={setReportRange}
          onApply={(nextRange) => void applyReportRange(nextRange)}
          onExport={exportReport}
          onOpenAnalysis={() => openView("product-analysis")}
        />
      ) : null}
      {!loading && view === "purchasing" ? (
        <>
          <DaftarPembelian orders={orders} onCreateOrder={openPurchaseModal} />
          <DaftarPemasok
            suppliers={suppliers}
            onAdd={() => setModal("supplier")}
          />
        </>
      ) : null}
      {!loading && view === "stock" ? (
        <PersediaanStok
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
        <PengaturanAkses
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
        <FiturOperasionalAdmin
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
                      {gambarProdukContoh.map((image) => (
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
                      <PilihanCari
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
                      </PilihanCari>
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
                  <PilihanCari
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
                  </PilihanCari>
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
                        <PilihanCari
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
                        </PilihanCari>
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
                          {formatRupiah(line.quantity * line.unitCost)}
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
              <strong className="fs-5">{formatRupiah(purchaseTotal)}</strong>
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
              <PilihanCari
                value={adjustmentProduct}
                onChange={(event) => setAdjustmentProduct(event.target.value)}
              >
                {stock.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · gudang {product.warehouse_stock} · kasir{" "}
                    {product.sales_stock}
                  </option>
                ))}
              </PilihanCari>
            </Form.Group>
            <Form.Group controlId="adjustment-area">
              <Form.Label>Lokasi stok</Form.Label>
              <PilihanCari
                value={adjustmentArea}
                onChange={(event) =>
                  setAdjustmentArea(event.target.value as "warehouse" | "sales")
                }
              >
                <option value="sales">Kasir / rak penjualan</option>
                <option value="warehouse">Gudang</option>
              </PilihanCari>
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
              <PilihanCari
                value={transferProduct}
                onChange={(event) => setTransferProduct(event.target.value)}
              >
                {stock.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · gudang {product.warehouse_stock} · kasir{" "}
                    {product.sales_stock}
                  </option>
                ))}
              </PilihanCari>
            </Form.Group>
            <Form.Group controlId="transfer-direction">
              <Form.Label>Arah transfer</Form.Label>
              <PilihanCari
                value={transferDirection}
                onChange={(event) =>
                  setTransferDirection(
                    event.target.value as "to_sales" | "to_warehouse",
                  )
                }
              >
                <option value="to_sales">Gudang → kasir</option>
                <option value="to_warehouse">Kasir → gudang</option>
              </PilihanCari>
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
    </KerangkaAdmin>
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
