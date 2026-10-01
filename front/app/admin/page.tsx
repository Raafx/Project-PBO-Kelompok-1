"use client";

import {
  ArrowDownToLine,
  BarChart3,
  Banknote,
  Boxes,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  ClipboardList,
  Download,
  FileBarChart,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  MapPin,
  PackageCheck,
  PackagePlus,
  Phone,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Save,
  Search,
  ShoppingCart,
  TrendingUp,
  Truck,
  UsersRound,
  WalletCards,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  createPurchaseOrder,
  createStockAdjustment,
  createSupplier,
  isApiConfigured,
  loadAdminDashboard,
  loadAdminSales,
  loadAdminStock,
  loadPurchaseOrders,
  loadSalesReport,
  loadSuppliers,
  receivePurchaseOrder,
  submitPurchaseOrder,
  type AdminDashboard,
  type AdminSale,
  type PurchaseOrder,
  type SalesReport,
  type StockItem,
  type Supplier,
} from "../api";
import styles from "./admin.module.css";

type AdminView = "overview" | "sales" | "reports" | "stock" | "purchasing" | "suppliers";
type ModalName = "purchase" | "supplier" | "adjustment" | "receive" | null;
type PurchaseLine = { key: string; barcode: string; quantity: number; unitCost: number };

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

const navigation: Array<{ id: AdminView; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
  { id: "sales", label: "Penjualan", icon: ReceiptText },
  { id: "reports", label: "Laporan", icon: BarChart3 },
  { id: "stock", label: "Persediaan", icon: Boxes },
  { id: "purchasing", label: "Pembelian", icon: ShoppingCart },
  { id: "suppliers", label: "Supplier", icon: Building2 },
];

const paymentLabels: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  debit: "Debit",
  credit: "Kredit",
  wallet: "E-Wallet",
  voucher: "Voucher",
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

const statusLabels: Record<PurchaseOrder["status"], string> = {
  draft: "Draft",
  ordered: "Dipesan",
  partially_received: "Diterima sebagian",
  received: "Selesai",
  cancelled: "Dibatalkan",
};

function formatMoney(value: number) {
  return moneyFormatter.format(value).replace(/\s/g, "");
}

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : "Belum ditentukan";
}

function orderQuantity(order: PurchaseOrder) {
  return order.items.reduce((total, item) => total + item.quantity_ordered, 0);
}

function StatusPill({ status }: { status: PurchaseOrder["status"] }) {
  return <span className={`${styles.status} ${styles[`status_${status}`]}`}>{statusLabels[status]}</span>;
}

export default function AdminPage() {
  const [view, setView] = useState<AdminView>("overview");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [sales, setSales] = useState<AdminSale[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<ModalName>(null);
  const [stockSearch, setStockSearch] = useState("");
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
  const [purchaseLines, setPurchaseLines] = useState<PurchaseLine[]>([
    { key: "initial", barcode: "", quantity: 1, unitCost: 0 },
  ]);
  const [adjustmentProduct, setAdjustmentProduct] = useState("");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);
  const [receiveLines, setReceiveLines] = useState<Record<string, number>>({});

  const refreshData = useCallback(async () => {
    if (!isApiConfigured) {
      setError("Backend belum dikonfigurasi. Jalankan FastAPI dan isi NEXT_PUBLIC_API_URL.");
      setLoading(false);
      return;
    }
    setError("");
    try {
      const [nextDashboard, nextStock, nextSuppliers, nextOrders, nextSales, nextReport] = await Promise.all([
        loadAdminDashboard(),
        loadAdminStock(),
        loadSuppliers(),
        loadPurchaseOrders(),
        loadAdminSales(),
        loadSalesReport(),
      ]);
      setDashboard(nextDashboard);
      setStock(nextStock);
      setSuppliers(nextSuppliers);
      setOrders(nextOrders);
      setSales(nextSales);
      setReport(nextReport);
      setReportRange({ from: nextReport.date_from, to: nextReport.date_to });
      setPurchaseSupplier((current) => current || nextSuppliers[0]?.id || "");
      setAdjustmentProduct((current) => current || nextStock[0]?.id || "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Data admin gagal dimuat");
    } finally {
      setLoading(false);
    }
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

  const filteredSales = useMemo(() => {
    const query = salesSearch.trim().toLocaleLowerCase("id-ID");
    return sales.filter((sale) => {
      const matchesStatus = salesStatus === "all" || sale.status === salesStatus;
      const matchesQuery = !query || [sale.transaction_no, sale.cashier_name, sale.member_name || ""]
        .some((value) => value.toLocaleLowerCase("id-ID").includes(query));
      return matchesStatus && matchesQuery;
    });
  }, [sales, salesSearch, salesStatus]);

  const purchaseTotal = useMemo(
    () => purchaseLines.reduce((total, line) => total + line.quantity * line.unitCost, 0),
    [purchaseLines],
  );

  function showToast(message: string) {
    setToast(message);
  }

  async function applyReportRange() {
    setWorking(true);
    setError("");
    try {
      const nextReport = await loadSalesReport(reportRange.from, reportRange.to);
      setReport(nextReport);
      showToast("Rentang laporan diperbarui.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Laporan gagal dimuat");
    } finally {
      setWorking(false);
    }
  }

  function exportReport() {
    if (!report) return;
    const rows = [
      ["Tanggal", "Transaksi", "Omzet"],
      ...report.daily_sales.map((item) => [item.date, item.transaction_count, item.total_sales]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `laporan-mymarket-${report.date_from}-${report.date_to}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function openPurchaseModal() {
    setPurchaseLines([{ key: crypto.randomUUID(), barcode: "", quantity: 1, unitCost: 0 }]);
    setPurchaseSupplier(suppliers[0]?.id || "");
    setPurchaseDate("");
    setPurchaseNotes("");
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
      setView("suppliers");
      showToast("Supplier baru berhasil disimpan.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Supplier gagal disimpan");
    } finally {
      setWorking(false);
    }
  }

  async function submitPurchaseForm(event: FormEvent) {
    event.preventDefault();
    const validLines = purchaseLines.filter((line) => line.barcode && line.quantity > 0);
    if (!purchaseSupplier || validLines.length === 0) {
      setError("Pilih supplier dan minimal satu produk.");
      return;
    }
    setWorking(true);
    setError("");
    try {
      await createPurchaseOrder({
        supplier_id: purchaseSupplier,
        store_code: "MY-001",
        expected_date: purchaseDate || undefined,
        notes: purchaseNotes || undefined,
        items: validLines.map((line) => ({
          barcode: line.barcode,
          quantity: line.quantity,
          unit_cost: line.unitCost,
        })),
      });
      setModal(null);
      await refreshData();
      setView("purchasing");
      showToast("Draft purchase order berhasil dibuat.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Purchase order gagal dibuat");
    } finally {
      setWorking(false);
    }
  }

  async function sendOrder(order: PurchaseOrder) {
    setWorking(true);
    try {
      await submitPurchaseOrder(order.id);
      await refreshData();
      showToast(`${order.po_number} dikirim ke supplier.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "PO gagal dikirim");
    } finally {
      setWorking(false);
    }
  }

  function openReceiveOrder(order: PurchaseOrder) {
    setReceivingOrder(order);
    setReceiveLines(
      Object.fromEntries(
        order.items.map((item) => [item.id, item.quantity_ordered - item.quantity_received]),
      ),
    );
    setModal("receive");
  }

  async function receiveOrder(event: FormEvent) {
    event.preventDefault();
    if (!receivingOrder) return;
    const items = receivingOrder.items
      .map((item) => ({ item_id: item.id, quantity: receiveLines[item.id] || 0 }))
      .filter((item) => item.quantity > 0);
    if (!items.length) {
      setError("Isi minimal satu jumlah barang yang diterima.");
      return;
    }
    setWorking(true);
    try {
      await receivePurchaseOrder(receivingOrder.id, items);
      setModal(null);
      setReceivingOrder(null);
      await refreshData();
      showToast(`${receivingOrder.po_number} diterima. Stok sudah diperbarui.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Penerimaan barang gagal");
    } finally {
      setWorking(false);
    }
  }

  function openAdjustment(product?: StockItem) {
    setAdjustmentProduct(product?.id || stock[0]?.id || "");
    setAdjustmentQuantity(0);
    setAdjustmentNote("");
    setModal("adjustment");
  }

  async function submitAdjustment(event: FormEvent) {
    event.preventDefault();
    if (!adjustmentProduct || adjustmentQuantity === 0 || !adjustmentNote.trim()) {
      setError("Pilih produk, isi perubahan jumlah, dan alasan koreksi.");
      return;
    }
    setWorking(true);
    try {
      await createStockAdjustment({
        product_id: adjustmentProduct,
        quantity_change: adjustmentQuantity,
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

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarPanel}>
          <div className={styles.brand}><span><b>MYMARKET</b><small>Admin operasional</small></span></div>
          <nav className={styles.navigation} aria-label="Navigasi admin">
            <span className={styles.navLabel}>Operasional toko</span>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={view === item.id ? styles.navActive : ""} onClick={() => setView(item.id)}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.id === "stock" && dashboard?.low_stock_count ? <small>{dashboard.low_stock_count}</small> : null}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <div className={styles.breadcrumb}><span>Admin</span><ChevronRight size={13} /><b>{navigation.find((item) => item.id === view)?.label}</b></div>
            <h1>{navigation.find((item) => item.id === view)?.label}</h1>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconButton} onClick={() => void refreshData()} title="Muat ulang" aria-label="Muat ulang data">
              <RefreshCw size={17} />
            </button>
          </div>
        </header>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <CircleAlert size={18} /><span>{error}</span>
            <button onClick={() => setError("")} aria-label="Tutup pesan"><X size={16} /></button>
          </div>
        )}

        {loading ? <AdminLoading /> : null}

        {!loading && !dashboard ? (
          <section className={styles.loadFailure}>
            <CircleAlert size={24} />
            <div>
              <h2>Data admin belum dapat ditampilkan</h2>
              <p>Pastikan backend aktif, lalu muat ulang data tanpa meninggalkan halaman ini.</p>
            </div>
            <button className={styles.primaryButton} onClick={() => { setLoading(true); void refreshData(); }}>
              <RefreshCw size={16} />Muat ulang
            </button>
          </section>
        ) : null}

        {!loading && view === "overview" && dashboard && report ? (
          <Overview
            dashboard={dashboard}
            report={report}
            onOpenPurchasing={() => setView("purchasing")}
            onOpenStock={() => setView("stock")}
            onOpenSales={() => setView("sales")}
            onOpenReports={() => setView("reports")}
          />
        ) : null}

        {!loading && view === "sales" ? (
          <SalesView sales={filteredSales} search={salesSearch} status={salesStatus} onSearch={setSalesSearch} onStatus={setSalesStatus} />
        ) : null}

        {!loading && view === "reports" && report ? (
          <ReportsView
            report={report}
            range={reportRange}
            working={working}
            onRangeChange={setReportRange}
            onApply={() => void applyReportRange()}
            onExport={exportReport}
          />
        ) : null}

        {!loading && view === "purchasing" ? (
          <PurchasingView
            orders={orders}
            working={working}
            onCreateOrder={openPurchaseModal}
            onSend={(order) => void sendOrder(order)}
            onReceive={openReceiveOrder}
          />
        ) : null}

        {!loading && view === "stock" ? (
          <StockView
            stock={filteredStock}
            search={stockSearch}
            onSearch={setStockSearch}
            onAdjust={openAdjustment}
            onCreateOrder={openPurchaseModal}
          />
        ) : null}

        {!loading && view === "suppliers" ? (
          <SuppliersView suppliers={suppliers} onAdd={() => setModal("supplier")} />
        ) : null}
      </main>

      {modal === "purchase" ? (
        <div className={styles.scrim} onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}>
          <section className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="purchase-title">
            <div className={styles.sheetHeader}>
              <div><span className={styles.sheetIcon}><ShoppingCart size={20} /></span><div><small>Pengadaan</small><h2 id="purchase-title">Buat purchase order</h2></div></div>
              <button onClick={() => setModal(null)} aria-label="Tutup"><X size={18} /></button>
            </div>
            <form onSubmit={submitPurchaseForm}>
              <div className={styles.formGrid}>
                <label><span>Supplier</span><select value={purchaseSupplier} onChange={(event) => setPurchaseSupplier(event.target.value)} required>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
                <label><span>Estimasi tiba</span><input type="date" value={purchaseDate} onChange={(event) => setPurchaseDate(event.target.value)} /></label>
              </div>
              <div className={styles.lineHeader}><div><b>Daftar barang</b><small>Harga beli dapat disesuaikan sebelum disimpan.</small></div><button type="button" onClick={() => setPurchaseLines((lines) => [...lines, { key: crypto.randomUUID(), barcode: "", quantity: 1, unitCost: 0 }])}><Plus size={15} />Tambah baris</button></div>
              <div className={styles.orderLines}>
                {purchaseLines.map((line, index) => (
                  <div className={styles.orderLine} key={line.key}>
                    <span className={styles.lineNumber}>{index + 1}</span>
                    <label><span>Produk</span><select value={line.barcode} onChange={(event) => selectLineProduct(line.key, event.target.value)} required><option value="">Pilih produk</option>{stock.map((product) => <option key={product.id} value={product.barcode}>{product.name} · stok {product.stock}</option>)}</select></label>
                    <label><span>Jumlah</span><input type="number" min="1" max="100000" value={line.quantity} onChange={(event) => updatePurchaseLine(line.key, { quantity: Number(event.target.value) })} /></label>
                    <label><span>Harga beli</span><input type="number" min="0" value={line.unitCost} onChange={(event) => updatePurchaseLine(line.key, { unitCost: Number(event.target.value) })} /></label>
                    <strong>{formatMoney(line.quantity * line.unitCost)}</strong>
                    <button type="button" className={styles.removeLine} disabled={purchaseLines.length === 1} onClick={() => setPurchaseLines((lines) => lines.filter((item) => item.key !== line.key))} aria-label="Hapus baris"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <label className={styles.fullField}><span>Catatan untuk supplier</span><textarea rows={3} value={purchaseNotes} onChange={(event) => setPurchaseNotes(event.target.value)} placeholder="Contoh: kirim sebelum pukul 12.00, hubungi gudang saat tiba" /></label>
              <div className={styles.sheetFooter}><div><small>Total pembelian</small><strong>{formatMoney(purchaseTotal)}</strong></div><button type="button" className={styles.cancelButton} onClick={() => setModal(null)}>Batal</button><button className={styles.primaryButton} disabled={working}>{working ? <LoaderCircle className={styles.spin} size={16} /> : <ClipboardList size={16} />}Simpan draft</button></div>
            </form>
          </section>
        </div>
      ) : null}

      {modal === "supplier" ? (
        <div className={styles.scrim} onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}>
          <section className={`${styles.sheet} ${styles.smallSheet}`} role="dialog" aria-modal="true" aria-labelledby="supplier-title">
            <div className={styles.sheetHeader}><div><span className={styles.sheetIcon}><Building2 size={20} /></span><div><small>Mitra pengadaan</small><h2 id="supplier-title">Supplier baru</h2></div></div><button onClick={() => setModal(null)} aria-label="Tutup"><X size={18} /></button></div>
            <form onSubmit={submitSupplierForm}>
              <div className={styles.formGrid}>
                <label><span>Kode supplier</span><input value={supplierForm.code} onChange={(event) => setSupplierForm({ ...supplierForm, code: event.target.value.toUpperCase() })} placeholder="SUP-004" required /></label>
                <label><span>Nama perusahaan</span><input value={supplierForm.name} onChange={(event) => setSupplierForm({ ...supplierForm, name: event.target.value })} placeholder="PT Mitra Distribusi" required /></label>
                <label><span>Kontak utama</span><input value={supplierForm.contact_person} onChange={(event) => setSupplierForm({ ...supplierForm, contact_person: event.target.value })} placeholder="Nama sales" /></label>
                <label><span>Nomor telepon</span><input value={supplierForm.phone} onChange={(event) => setSupplierForm({ ...supplierForm, phone: event.target.value })} placeholder="08xx xxxx xxxx" /></label>
                <label className={styles.fullField}><span>Email</span><input type="email" value={supplierForm.email} onChange={(event) => setSupplierForm({ ...supplierForm, email: event.target.value })} placeholder="order@supplier.id" /></label>
                <label className={styles.fullField}><span>Alamat</span><textarea rows={3} value={supplierForm.address} onChange={(event) => setSupplierForm({ ...supplierForm, address: event.target.value })} /></label>
              </div>
              <div className={styles.sheetFooter}><span /><button type="button" className={styles.cancelButton} onClick={() => setModal(null)}>Batal</button><button className={styles.primaryButton} disabled={working}>{working ? <LoaderCircle className={styles.spin} size={16} /> : <Save size={16} />}Simpan supplier</button></div>
            </form>
          </section>
        </div>
      ) : null}

      {modal === "adjustment" ? (
        <div className={styles.scrim} onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}>
          <section className={`${styles.sheet} ${styles.smallSheet}`} role="dialog" aria-modal="true" aria-labelledby="adjustment-title">
            <div className={styles.sheetHeader}><div><span className={styles.sheetIcon}><Warehouse size={20} /></span><div><small>Stok opname</small><h2 id="adjustment-title">Koreksi persediaan</h2></div></div><button onClick={() => setModal(null)} aria-label="Tutup"><X size={18} /></button></div>
            <form onSubmit={submitAdjustment}>
              <div className={styles.formStack}>
                <label><span>Produk</span><select value={adjustmentProduct} onChange={(event) => setAdjustmentProduct(event.target.value)}>{stock.map((product) => <option key={product.id} value={product.id}>{product.name} · stok {product.stock}</option>)}</select></label>
                <label><span>Perubahan jumlah</span><input type="number" value={adjustmentQuantity} onChange={(event) => setAdjustmentQuantity(Number(event.target.value))} /><small>Gunakan angka negatif untuk mengurangi stok.</small></label>
                <label><span>Alasan koreksi</span><textarea rows={3} value={adjustmentNote} onChange={(event) => setAdjustmentNote(event.target.value)} placeholder="Contoh: 2 unit rusak saat stok opname" required /></label>
              </div>
              <div className={styles.sheetFooter}><span /><button type="button" className={styles.cancelButton} onClick={() => setModal(null)}>Batal</button><button className={styles.primaryButton} disabled={working}>{working ? <LoaderCircle className={styles.spin} size={16} /> : <Save size={16} />}Simpan koreksi</button></div>
            </form>
          </section>
        </div>
      ) : null}

      {modal === "receive" && receivingOrder ? (
        <div className={styles.scrim} onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}>
          <section className={`${styles.sheet} ${styles.smallSheet}`} role="dialog" aria-modal="true" aria-labelledby="receive-title">
            <div className={styles.sheetHeader}><div><span className={styles.sheetIcon}><ArrowDownToLine size={20} /></span><div><small>{receivingOrder.po_number}</small><h2 id="receive-title">Terima barang</h2></div></div><button onClick={() => setModal(null)} aria-label="Tutup"><X size={18} /></button></div>
            <form onSubmit={receiveOrder}>
              <div className={styles.receiveIntro}><Truck size={18} /><div><b>{receivingOrder.supplier.name}</b><small>Isi jumlah fisik yang benar-benar tiba. Sisa barang tetap tercatat dalam PO.</small></div></div>
              <div className={styles.receiveList}>
                {receivingOrder.items.map((item) => {
                  const remaining = item.quantity_ordered - item.quantity_received;
                  return <label key={item.id}><div><b>{item.product_name}</b><small>Dipesan {item.quantity_ordered} · sudah diterima {item.quantity_received} · sisa {remaining}</small></div><input type="number" min="0" max={remaining} value={receiveLines[item.id] ?? 0} onChange={(event) => setReceiveLines((current) => ({ ...current, [item.id]: Number(event.target.value) }))} /></label>;
                })}
              </div>
              <div className={styles.receiveNotice}><CircleAlert size={15} /><span>Penerimaan akan langsung menambah stok dan tidak dapat dikirim dua kali.</span></div>
              <div className={styles.sheetFooter}><span /><button type="button" className={styles.cancelButton} onClick={() => setModal(null)}>Batal</button><button className={styles.primaryButton} disabled={working}>{working ? <LoaderCircle className={styles.spin} size={16} /> : <PackageCheck size={16} />}Terima ke stok</button></div>
            </form>
          </section>
        </div>
      ) : null}

      {toast ? <div className={styles.toast}><span>{toast}</span></div> : null}
    </div>
  );
}

function AdminLoading() {
  return (
    <div className={styles.loadingLayout} aria-live="polite" aria-busy="true">
      <div className={styles.loadingHeader}><LoaderCircle className={styles.spin} size={18} /><span>Menyiapkan data operasional…</span></div>
      <section className={styles.loadingMetrics} aria-hidden="true">
        {[0, 1, 2, 3].map((item) => <span key={item} />)}
      </section>
      <section className={styles.loadingPanels} aria-hidden="true">
        <span />
        <span />
      </section>
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
  const metrics = [
    { label: "Omzet 30 hari", value: formatMoney(report.total_sales), note: `${numberFormatter.format(report.transaction_count)} transaksi`, icon: CircleDollarSign },
    { label: "Rata-rata transaksi", value: formatMoney(report.average_transaction), note: `${numberFormatter.format(report.item_count)} item terjual`, icon: ReceiptText },
    { label: "Estimasi laba kotor", value: formatMoney(report.estimated_gross_profit), note: "Berdasarkan harga pokok", icon: TrendingUp },
    { label: "Unit persediaan", value: numberFormatter.format(dashboard.stock_units), note: `${dashboard.low_stock_count} produk perlu perhatian`, icon: Boxes, warning: dashboard.low_stock_count > 0 },
  ];
  return (
    <div className={styles.contentStack}>
      <section className={styles.metrics} aria-label="Ringkasan operasional">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return <article key={metric.label} className={metric.warning ? styles.metricWarning : ""}><span><Icon size={20} /></span><div><small>{metric.label}</small><strong>{metric.value}</strong><em>{metric.note}</em></div></article>;
        })}
      </section>
      <section className={styles.dashboardGrid}>
        <article className={`${styles.panel} ${styles.salesChartPanel}`}>
          <div className={styles.panelHeader}><div><span className={styles.panelIcon}><BarChart3 size={17} /></span><div><h2>Ikhtisar penjualan</h2><p>Omzet harian selama periode laporan aktif.</p></div></div><button onClick={onOpenReports}>Buka laporan<ChevronRight size={15} /></button></div>
          <SalesTrendChart data={report.daily_sales} />
        </article>
        <article className={`${styles.panel} ${styles.paymentPanel}`}>
          <div className={styles.panelHeader}><div><span className={styles.panelIcon}><WalletCards size={17} /></span><div><h2>Metode pembayaran</h2><p>Komposisi transaksi selesai.</p></div></div></div>
          <BreakdownList items={report.payment_methods.map((item) => ({ ...item, label: paymentLabels[item.label] || item.label }))} empty="Belum ada pembayaran pada periode ini." unit="transaksi" />
        </article>
        <article className={`${styles.panel} ${styles.recentSalesPanel}`}>
          <div className={styles.panelHeader}><div><span className={styles.panelIcon}><ReceiptText size={17} /></span><div><h2>Transaksi terbaru</h2><p>Penjualan terakhir dari seluruh kasir.</p></div></div><button onClick={onOpenSales}>Lihat semua<ChevronRight size={15} /></button></div>
          <SalesTable sales={report.recent_sales.slice(0, 6)} compact />
        </article>
        <article className={`${styles.panel} ${styles.stockAlertPanel}`}>
          <div className={styles.panelHeader}><div><span className={styles.panelIcon}><CircleAlert size={17} /></span><div><h2>Peringatan stok</h2><p>Produk menyentuh batas minimum.</p></div></div><button onClick={onOpenStock}>Persediaan<ChevronRight size={15} /></button></div>
          <div className={styles.compactList}>
            {dashboard.low_stock_products.length ? dashboard.low_stock_products.slice(0, 5).map((product) => <div key={product.id}><span className={styles.productAvatar}>{product.name.slice(0, 2).toUpperCase()}</span><div><b>{product.name}</b><small>{product.category} · minimum {product.reorder_level}</small></div><span className={styles.stockDanger}><b>{product.stock}</b><small>tersisa</small></span></div>) : <EmptyState icon={PackageCheck} title="Stok dalam kondisi baik" copy="Tidak ada produk yang perlu dibeli ulang." />}
          </div>
        </article>
        <article className={`${styles.panel} ${styles.topProductsPanel}`}>
          <div className={styles.panelHeader}><div><span className={styles.panelIcon}><PackageCheck size={17} /></span><div><h2>Produk terlaris</h2><p>Peringkat berdasarkan unit terjual.</p></div></div></div>
          <TopProducts products={report.top_products.slice(0, 5)} />
        </article>
        <article className={`${styles.panel} ${styles.purchasePanel}`}>
          <div className={styles.panelHeader}><div><span className={styles.panelIcon}><ClipboardList size={17} /></span><div><h2>Purchase order terbaru</h2><p>Status pengadaan terakhir.</p></div></div><button onClick={onOpenPurchasing}>Lihat semua<ChevronRight size={15} /></button></div>
          <div className={styles.orderSummaryList}>
            {dashboard.recent_purchase_orders.length ? dashboard.recent_purchase_orders.slice(0, 5).map((order) => <div key={order.id}><div><b>{order.po_number}</b><small>{order.supplier.name} · {orderQuantity(order)} unit</small></div><div><strong>{formatMoney(order.subtotal)}</strong><StatusPill status={order.status} /></div></div>) : <EmptyState icon={ClipboardList} title="Belum ada purchase order" copy="Buat pesanan pertama dari menu Pembelian." />}
          </div>
        </article>
      </section>
    </div>
  );
}

function SalesView({ sales, search, status, onSearch, onStatus }: { sales: AdminSale[]; search: string; status: string; onSearch: (value: string) => void; onStatus: (value: string) => void }) {
  return <section className={`${styles.panel} ${styles.viewPanel}`}><div className={styles.tableToolbar}><div><h2>Riwayat transaksi POS</h2><p>Data pembayaran selesai, transaksi hold, dan transaksi dibatalkan.</p></div><div className={styles.toolbarButtons}><label className={styles.searchBox}><Search size={16} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Cari nomor transaksi atau kasir" /></label><select className={styles.filterSelect} value={status} onChange={(event) => onStatus(event.target.value)} aria-label="Filter status transaksi"><option value="all">Semua status</option><option value="completed">Selesai</option><option value="held">Hold</option><option value="cancelled">Dibatalkan</option></select></div></div><SalesTable sales={sales} />{!sales.length ? <EmptyState icon={ReceiptText} title="Transaksi tidak ditemukan" copy="Ubah kata kunci atau filter status untuk melihat transaksi lain." /> : null}</section>;
}

function ReportsView({ report, range, working, onRangeChange, onApply, onExport }: { report: SalesReport; range: { from: string; to: string }; working: boolean; onRangeChange: (value: { from: string; to: string }) => void; onApply: () => void; onExport: () => void }) {
  const metrics = [
    { label: "Total omzet", value: formatMoney(report.total_sales), icon: CircleDollarSign },
    { label: "Transaksi", value: numberFormatter.format(report.transaction_count), icon: ReceiptText },
    { label: "Item terjual", value: numberFormatter.format(report.item_count), icon: ShoppingCart },
    { label: "Rata-rata transaksi", value: formatMoney(report.average_transaction), icon: BarChart3 },
    { label: "Estimasi laba kotor", value: formatMoney(report.estimated_gross_profit), icon: TrendingUp },
    { label: "Diskon", value: formatMoney(report.total_discount), icon: Banknote },
  ];
  return <div className={styles.contentStack}>
    <section className={styles.reportControls}>
      <div><span className={styles.panelIcon}><CalendarDays size={18} /></span><div><b>Periode laporan</b><small>Maksimal 366 hari per penarikan data.</small></div></div>
      <label><span>Dari</span><input type="date" value={range.from} max={range.to} onChange={(event) => onRangeChange({ ...range, from: event.target.value })} /></label>
      <label><span>Sampai</span><input type="date" value={range.to} min={range.from} onChange={(event) => onRangeChange({ ...range, to: event.target.value })} /></label>
      <button className={styles.secondaryButton} disabled={working} onClick={onApply}>{working ? <LoaderCircle className={styles.spin} size={16} /> : <RefreshCw size={16} />}Terapkan</button>
      <button className={styles.secondaryButton} onClick={() => window.print()}><Printer size={16} />Cetak</button>
      <button className={styles.primaryButton} onClick={onExport}><Download size={16} />Ekspor CSV</button>
    </section>
    <section className={`${styles.metrics} ${styles.reportMetrics}`}>{metrics.map((metric) => { const Icon = metric.icon; return <article key={metric.label}><span><Icon size={20} /></span><div><small>{metric.label}</small><strong>{metric.value}</strong></div></article>; })}</section>
    <section className={styles.reportGrid}>
      <article className={`${styles.panel} ${styles.reportTrend}`}><div className={styles.panelHeader}><div><span className={styles.panelIcon}><FileBarChart size={17} /></span><div><h2>Tren omzet</h2><p>{formatDate(report.date_from)} sampai {formatDate(report.date_to)}</p></div></div></div><SalesTrendChart data={report.daily_sales} /></article>
      <article className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.panelIcon}><WalletCards size={17} /></span><div><h2>Metode pembayaran</h2><p>Nilai dan jumlah transaksi.</p></div></div></div><BreakdownList items={report.payment_methods.map((item) => ({ ...item, label: paymentLabels[item.label] || item.label }))} empty="Belum ada pembayaran." unit="transaksi" /></article>
      <article className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.panelIcon}><Boxes size={17} /></span><div><h2>Penjualan kategori</h2><p>Kontribusi omzet per kategori.</p></div></div></div><BreakdownList items={report.category_sales} empty="Belum ada kategori terjual." unit="item" /></article>
      <article className={`${styles.panel} ${styles.reportProducts}`}><div className={styles.panelHeader}><div><span className={styles.panelIcon}><PackageCheck size={17} /></span><div><h2>Produk terlaris</h2><p>Produk dengan unit penjualan tertinggi.</p></div></div></div><TopProducts products={report.top_products} /></article>
    </section>
  </div>;
}

function SalesTrendChart({ data }: { data: SalesReport["daily_sales"] }) {
  const width = 760;
  const height = 220;
  const padding = 28;
  const max = Math.max(...data.map((item) => item.total_sales), 1);
  const points = data.map((item, index) => {
    const x = data.length <= 1 ? width / 2 : padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (item.total_sales / max) * (height - padding * 2);
    return { x, y, item };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const labelIndexes = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);
  return <div className={styles.chartWrap}><div className={styles.chartSummary}><span><small>Total omzet</small><strong>{formatMoney(data.reduce((sum, item) => sum + item.total_sales, 0))}</strong></span><span><small>Hari transaksi</small><strong>{data.filter((item) => item.transaction_count > 0).length}</strong></span></div><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafik omzet harian" preserveAspectRatio="none"><line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className={styles.chartAxis} /><line x1={padding} y1={padding} x2={padding} y2={height - padding} className={styles.chartAxis} />{line ? <polyline points={line} className={styles.chartLine} /> : null}{points.map((point, index) => <g key={point.item.date}><circle cx={point.x} cy={point.y} r="4" className={styles.chartPoint} />{labelIndexes.has(index) ? <text x={point.x} y={height - 7} textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"}>{new Date(`${point.item.date}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</text> : null}</g>)}</svg></div>;
}

function BreakdownList({ items, empty, unit }: { items: Array<{ label: string; amount: number; count: number }>; empty: string; unit: string }) {
  const max = Math.max(...items.map((item) => item.amount), 1);
  if (!items.length) return <div className={styles.inlineEmpty}>{empty}</div>;
  return <div className={styles.breakdownList}>{items.slice(0, 7).map((item) => <div key={item.label}><div><b>{item.label}</b><span>{formatMoney(item.amount)}</span></div><div className={styles.progressTrack}><i style={{ width: `${Math.max(5, (item.amount / max) * 100)}%` }} /></div><small>{numberFormatter.format(item.count)} {unit}</small></div>)}</div>;
}

function TopProducts({ products }: { products: SalesReport["top_products"] }) {
  if (!products.length) return <div className={styles.inlineEmpty}>Belum ada produk terjual pada periode ini.</div>;
  return <div className={styles.topProducts}>{products.map((product, index) => <div key={product.barcode}><span>{index + 1}</span><div><b>{product.name}</b><small>{product.barcode}</small></div><div><b>{numberFormatter.format(product.quantity)} unit</b><small>{formatMoney(product.revenue)}</small></div></div>)}</div>;
}

function SalesTable({ sales, compact = false }: { sales: AdminSale[]; compact?: boolean }) {
  if (!sales.length) return null;
  return <div className={styles.tableWrap}><table><thead><tr><th>Transaksi</th><th>Waktu</th><th>Kasir / pelanggan</th><th>Bayar</th><th className={styles.alignCenter}>Item</th><th>Status</th><th className={styles.alignRight}>Total</th></tr></thead><tbody>{sales.map((sale) => <tr key={sale.id}><td><b>{sale.transaction_no}</b></td><td>{dateTimeFormatter.format(new Date(sale.created_at))}</td><td><b>{sale.cashier_name}</b><small>{sale.member_name || "Pelanggan umum"}</small></td><td>{sale.payment_method ? paymentLabels[sale.payment_method] || sale.payment_method : "—"}</td><td className={styles.alignCenter}>{sale.item_count}</td><td><span className={`${styles.status} ${styles[`status_${sale.status}`]}`}>{sale.status === "completed" ? "Selesai" : sale.status === "held" ? "Hold" : "Dibatalkan"}</span></td><td className={styles.alignRight}><b>{formatMoney(sale.total)}</b>{!compact && sale.discount > 0 ? <small>Diskon {formatMoney(sale.discount)}</small> : null}</td></tr>)}</tbody></table></div>;
}

function PurchasingView({ orders, working, onCreateOrder, onSend, onReceive }: { orders: PurchaseOrder[]; working: boolean; onCreateOrder: () => void; onSend: (order: PurchaseOrder) => void; onReceive: (order: PurchaseOrder) => void }) {
  return <section className={`${styles.panel} ${styles.viewPanel}`}><div className={styles.tableToolbar}><div><h2>Purchase order</h2><p>Pesan barang, pantau pengiriman, lalu terima ke persediaan.</p></div><button className={styles.primaryButton} onClick={onCreateOrder}><Plus size={16} />Buat purchase order</button></div>{orders.length ? <div className={styles.tableWrap}><table><thead><tr><th>Nomor PO</th><th>Supplier</th><th>Pesanan</th><th>Estimasi tiba</th><th>Status</th><th className={styles.alignRight}>Total</th><th aria-label="Aksi" /></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><b>{order.po_number}</b><small>{dateFormatter.format(new Date(order.created_at))}</small></td><td><b>{order.supplier.name}</b><small>{order.supplier.code}</small></td><td><b>{orderQuantity(order)} unit</b><small>{order.items.length} macam produk</small></td><td>{formatDate(order.expected_date)}</td><td><StatusPill status={order.status} /></td><td className={styles.alignRight}><b>{formatMoney(order.subtotal)}</b></td><td className={styles.rowActions}>{order.status === "draft" ? <button disabled={working} onClick={() => onSend(order)}>Kirim PO</button> : null}{order.status === "ordered" || order.status === "partially_received" ? <button className={styles.receiveButton} disabled={working} onClick={() => onReceive(order)}><ArrowDownToLine size={14} />Terima</button> : null}</td></tr>)}</tbody></table></div> : <EmptyState icon={ShoppingCart} title="Belum ada purchase order" copy="Gunakan tombol Buat purchase order di atas untuk membuat pesanan pertama." />}</section>;
}

function StockView({ stock, search, onSearch, onAdjust, onCreateOrder }: { stock: StockItem[]; search: string; onSearch: (value: string) => void; onAdjust: (product?: StockItem) => void; onCreateOrder: () => void }) {
  return <section className={styles.panel}><div className={styles.tableToolbar}><div><h2>Persediaan produk</h2><p>Stok aktual, harga pokok rata-rata, dan batas pembelian ulang.</p></div><div className={styles.toolbarButtons}><label className={styles.searchBox}><Search size={16} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Cari produk atau barcode" /></label><button className={styles.secondaryButton} onClick={() => onAdjust()}><Warehouse size={16} />Koreksi stok</button><button className={styles.primaryButton} onClick={onCreateOrder}><PackagePlus size={16} />Beli stok</button></div></div><div className={styles.tableWrap}><table><thead><tr><th>Produk</th><th>Lokasi</th><th className={styles.alignRight}>Harga pokok</th><th className={styles.alignRight}>Harga jual</th><th className={styles.alignCenter}>Batas</th><th className={styles.alignCenter}>Stok</th><th>Status</th><th aria-label="Aksi" /></tr></thead><tbody>{stock.map((product) => <tr key={product.id}><td><b>{product.name}</b><small>{product.barcode} · {product.category}</small></td><td>{product.location}</td><td className={styles.alignRight}>{formatMoney(product.cost_price)}</td><td className={styles.alignRight}><b>{formatMoney(product.price)}</b></td><td className={styles.alignCenter}>{product.reorder_level}</td><td className={styles.alignCenter}><strong className={product.stock_status !== "healthy" ? styles.lowNumber : ""}>{product.stock}</strong></td><td><span className={`${styles.stockStatus} ${styles[`stock_${product.stock_status}`]}`}>{product.stock_status === "healthy" ? "Aman" : product.stock_status === "low" ? "Menipis" : "Habis"}</span></td><td className={styles.rowActions}><button onClick={() => onAdjust(product)}>Sesuaikan</button></td></tr>)}</tbody></table></div>{!stock.length ? <EmptyState icon={Search} title="Produk tidak ditemukan" copy="Coba kata kunci atau barcode yang berbeda." /> : null}</section>;
}

function SuppliersView({ suppliers, onAdd }: { suppliers: Supplier[]; onAdd: () => void }) {
  return <div className={styles.contentStack}><section className={styles.supplierIntro}><div><span className={styles.panelIcon}><Truck size={19} /></span><div><h2>Mitra pemasok MYMARKET</h2><p>Simpan kontak supplier agar pembuatan purchase order lebih cepat dan konsisten.</p></div></div><button className={styles.primaryButton} onClick={onAdd}><Plus size={16} />Tambah supplier</button></section><section className={styles.supplierGrid}>{suppliers.map((supplier) => <article className={styles.supplierCard} key={supplier.id}><div className={styles.supplierTop}><span>{supplier.name.slice(0, 2).toUpperCase()}</span><div><small>{supplier.code}</small><h3>{supplier.name}</h3></div><i /></div><dl><div><dt><UsersRound size={15} />Kontak</dt><dd>{supplier.contact_person || "Belum diisi"}</dd></div><div><dt><Phone size={15} />Telepon</dt><dd>{supplier.phone || "Belum diisi"}</dd></div><div><dt><Mail size={15} />Email</dt><dd>{supplier.email || "Belum diisi"}</dd></div>{supplier.address ? <div><dt><MapPin size={15} />Alamat</dt><dd>{supplier.address}</dd></div> : null}</dl><footer><span>Aktif</span><small>Ditambahkan {dateFormatter.format(new Date(supplier.created_at))}</small></footer></article>)}</section>{!suppliers.length ? <EmptyState icon={Building2} title="Belum ada supplier" copy="Gunakan tombol Tambah supplier di atas untuk mulai mencatat pemasok." /> : null}</div>;
}

function EmptyState({ icon: Icon, title, copy }: { icon: LucideIcon; title: string; copy: string }) {
  return <div className={styles.empty}><span><Icon size={22} /></span><b>{title}</b><p>{copy}</p></div>;
}
