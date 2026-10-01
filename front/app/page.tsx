"use client";

import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Ban,
  Barcode,
  Boxes,
  Check,
  CircleCheck,
  CloudUpload,
  Coins,
  CreditCard,
  Crown,
  HelpCircle,
  Landmark,
  LockKeyhole,
  LogOut,
  Minus,
  PackageSearch,
  Pause,
  Percent,
  Plus,
  Printer,
  QrCode,
  ReceiptText,
  RotateCcw,
  Search,
  Smartphone,
  Store,
  Ticket,
  Trash2,
  Undo2,
  User,
  Volume2,
  VolumeX,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  helpShortcuts,
  matchesShortcut,
  paymentShortcutIds,
  shortcutRegistry,
  type ShortcutId,
} from "./shortcuts";
import { ScannerDetector } from "./scanner-detector";
import {
  isApiConfigured,
  loadProducts,
  lookupMember,
  saveCheckout,
  validateVoucher,
  type ApiMember,
} from "./api";

type Product = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  location: string;
  price: number;
};

type CartItem = Product & { qty: number };
type PaymentMethod = "cash" | "qris" | "debit" | "credit" | "wallet" | "voucher";
type DialogName =
  | "receipt"
  | "cashWarning"
  | "cancel"
  | "lock"
  | "logout"
  | "shortcuts"
  | null;
type FocusArea = "scan" | "table" | "payment" | "cash" | null;

const fallbackProducts: Product[] = [
  { id: "indomie", barcode: "8998866200224", name: "Indomie Goreng Original 85g", category: "Mi Instan", location: "Rak A-02", price: 3500 },
  { id: "aqua", barcode: "8886008101053", name: "Aqua Air Mineral 600 ml", category: "Minuman Ringan", location: "Chiller 01", price: 4000 },
  { id: "ultramilk", barcode: "8992753211118", name: "Ultra Milk UHT Full Cream 1000 ml", category: "Susu & Olahan", location: "Rak C-04", price: 21500 },
  { id: "silverqueen", barcode: "8991001101121", name: "SilverQueen Cokelat Almond 58g", category: "Cokelat & Snack", location: "Front Desk", price: 18900 },
  { id: "sunlight", barcode: "8999999052028", name: "Sunlight Pencuci Piring Jeruk Nipis 755 ml", category: "Home Care", location: "Rak D-01", price: 17500 },
  { id: "beras", barcode: "8993175112034", name: "Beras Premium Rojolele Super 5 Kg", category: "Sembako", location: "Pallet P-01", price: 78000 },
  { id: "kopi", barcode: "8991002101656", name: "Kopi Kapal Api Special Mix 10 sachet", category: "Kopi & Teh", location: "Rak B-03", price: 16800 },
  { id: "gula", barcode: "8997008340512", name: "Gulaku Premium 1 Kg", category: "Sembako", location: "Rak A-06", price: 18400 },
  { id: "tisu", barcode: "8993053710505", name: "Paseo Smart Facial Tissue 250 sheets", category: "Personal Care", location: "Rak D-04", price: 23900 },
];

const initialCart: CartItem[] = [
  { ...fallbackProducts[0], qty: 4 },
  { ...fallbackProducts[1], qty: 2 },
  { ...fallbackProducts[2], qty: 1 },
  { ...fallbackProducts[3], qty: 2 },
  { ...fallbackProducts[4], qty: 1 },
  { ...fallbackProducts[5], qty: 1 },
];

const paymentMethods: Array<{
  id: PaymentMethod;
  label: string;
  helper: string;
  icon: LucideIcon;
}> = [
  { id: "cash", label: "Tunai", helper: "Cash", icon: Banknote },
  { id: "qris", label: "QRIS", helper: "GoPay / OVO", icon: QrCode },
  { id: "debit", label: "Debit", helper: "EDC Bank", icon: Landmark },
  { id: "credit", label: "Kredit", helper: "Visa / Master", icon: CreditCard },
  { id: "wallet", label: "E-Wallet", helper: "DANA / Shopee", icon: Smartphone },
  { id: "voucher", label: "Voucher", helper: "Kupon MY", icon: Ticket },
];

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const integer = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

function money(value: number) {
  return rupiah.format(value).replace(/\s/g, "");
}

function shortcutDisplay(id: ShortcutId) {
  return shortcutRegistry[id].label;
}

function tenderPresets(total: number) {
  if (total <= 0) return [];
  const nextMultiple = (step: number) => {
    const rounded = Math.ceil(total / step) * step;
    return rounded === total ? rounded + step : rounded;
  };
  return [...new Set([total, nextMultiple(50000), nextMultiple(100000)])].slice(0, 4);
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [selectedId, setSelectedId] = useState("beras");
  const [query, setQuery] = useState("");
  const [scanError, setScanError] = useState("");
  const [pendingMultiplier, setPendingMultiplier] = useState(1);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [receivedText, setReceivedText] = useState("");
  const [cashInputError, setCashInputError] = useState("");
  const [presetIndex, setPresetIndex] = useState(-1);
  const [memberPhone, setMemberPhone] = useState("081255449011");
  const [memberFound, setMemberFound] = useState(true);
  const [member, setMember] = useState<ApiMember | null>({
    id: "SM-772910",
    phone: "081255449011",
    full_name: "Budi Santoso",
    tier: "SILVER",
    points: 1_250,
  });
  const [heldTransactions, setHeldTransactions] = useState<CartItem[][]>([]);
  const [qrisConfirmed, setQrisConfirmed] = useState(false);
  const [walletConfirmed, setWalletConfirmed] = useState(false);
  const [approvalCode, setApprovalCode] = useState("");
  const [cardConfirmed, setCardConfirmed] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherConfirmed, setVoucherConfirmed] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [dialog, setDialog] = useState<DialogName>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<{ item: CartItem; index: number } | null>(null);
  const [quantityBuffer, setQuantityBuffer] = useState("");
  const [announcement, setAnnouncement] = useState("Kasir siap digunakan.");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [focusArea, setFocusArea] = useState<FocusArea>("scan");
  const [isSaving, setIsSaving] = useState(false);
  const [receiptTransactionNo, setReceiptTransactionNo] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);
  const memberRef = useRef<HTMLInputElement>(null);
  const cashRef = useRef<HTMLInputElement>(null);
  const payRef = useRef<HTMLButtonElement>(null);
  const digitalConfirmRef = useRef<HTMLButtonElement>(null);
  const approvalRef = useRef<HTMLInputElement>(null);
  const voucherRef = useRef<HTMLInputElement>(null);
  const catalogSearchRef = useRef<HTMLInputElement>(null);
  const paymentRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const scannerOriginRef = useRef<{
    kind: "scan" | "cash" | "member" | "table" | "approval" | "voucher" | null;
    value: string;
  } | null>(null);
  const scannerStateRef = useRef({
    query,
    receivedText,
    memberPhone,
    quantityBuffer,
    approvalCode,
    voucherCode,
  });
  const hardwareScanRef = useRef<(value: string) => void>(() => undefined);
  const checkoutKeyRef = useRef("");

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  );
  const discount = 0;
  const tax = 0;
  const rounding = 0;
  const total = subtotal - discount + tax + rounding;
  const totalQty = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const received = Number(receivedText || 0);
  const effectiveReceived = receivedText ? received : total;
  const change = effectiveReceived - total;
  const cashShort = Boolean(receivedText) && received < total;
  const methodReady =
    paymentMethod === "cash"
      ? !cashShort && !cashInputError
      : paymentMethod === "qris"
        ? qrisConfirmed
        : paymentMethod === "wallet"
          ? walletConfirmed
          : paymentMethod === "debit" || paymentMethod === "credit"
            ? cardConfirmed
            : voucherConfirmed;
  const checkoutReason =
    cart.length === 0
      ? "Keranjang masih kosong"
      : paymentMessage;
  const canCheckout = cart.length > 0 && methodReady;
  const estimatedPoints = Math.floor(total / 10000);
  const presets = useMemo(() => tenderPresets(total), [total]);
  const contextualHint =
    focusArea === "scan"
      ? "Scan: Enter tambah item · 12*barcode untuk jumlah"
      : focusArea === "table"
        ? "Tabel: ↑↓ pilih · +/− jumlah · Del hapus · Ctrl+Z urungkan"
        : focusArea === "payment"
          ? "Metode bayar: panah atau 1–6 untuk memilih"
          : focusArea === "cash"
            ? "Tunai: ↑↓ pilih nominal cepat · Enter bayar"
            : "";

  const filteredProducts = useMemo(() => {
    const normalized = catalogQuery.trim().toLocaleLowerCase("id-ID");
    if (!normalized) return products;
    return products.filter(
      (product) =>
        product.name.toLocaleLowerCase("id-ID").includes(normalized) ||
        product.barcode.includes(normalized) ||
        product.category.toLocaleLowerCase("id-ID").includes(normalized),
    );
  }, [catalogQuery, products]);

  const scanSuggestion = useMemo(() => {
    const raw = query.trim().replace(/^\d+\*/, "").toLocaleLowerCase("id-ID");
    if (!raw) return null;
    return (
      products.find((product) => product.barcode === raw) ??
      products.find(
        (product) =>
          product.name.toLocaleLowerCase("id-ID").includes(raw) ||
          product.barcode.includes(raw),
      ) ??
      null
    );
  }, [products, query]);

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    const frame = window.requestAnimationFrame(updateClock);
    const timer = window.setInterval(updateClock, 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!isApiConfigured) return;
    const controller = new AbortController();
    loadProducts(controller.signal)
      .then((items) => {
        if (items.length) setProducts(items);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setAnnouncement("Backend tidak terhubung; katalog lokal tetap digunakan.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!catalogOpen) return;
    const frame = window.requestAnimationFrame(() => catalogSearchRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [catalogOpen]);

  useEffect(() => {
    const detector = new ScannerDetector();

    const getOriginKind = (target: EventTarget | null) => {
      if (target === searchRef.current) return "scan" as const;
      if (target === cashRef.current) return "cash" as const;
      if (target === memberRef.current) return "member" as const;
      if (target === approvalRef.current) return "approval" as const;
      if (target === voucherRef.current) return "voucher" as const;
      if (target === document.activeElement && target === document.querySelector(".cart-table")) {
        return "table" as const;
      }
      return null;
    };

    const snapshotOrigin = (target: EventTarget | null) => {
      const kind = getOriginKind(target);
      const current = scannerStateRef.current;
      const value =
        kind === "scan"
          ? current.query
          : kind === "cash"
            ? current.receivedText
            : kind === "member"
              ? current.memberPhone
              : kind === "table"
                ? current.quantityBuffer
                : kind === "approval"
                  ? current.approvalCode
                  : kind === "voucher"
                    ? current.voucherCode
                    : "";
      scannerOriginRef.current = { kind, value };
    };

    const rollbackOrigin = () => {
      const origin = scannerOriginRef.current;
      if (!origin) return;
      if (origin.kind === "scan") setQuery(origin.value);
      if (origin.kind === "cash") setReceivedText(origin.value);
      if (origin.kind === "member") setMemberPhone(origin.value);
      if (origin.kind === "table") setQuantityBuffer(origin.value);
      if (origin.kind === "approval") setApprovalCode(origin.value);
      if (origin.kind === "voucher") setVoucherCode(origin.value);
    };

    const handleScannerCapture = (event: KeyboardEvent) => {
      if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "Enter" && event.key.length !== 1) return;

      const result = detector.push(event.key, event.timeStamp);
      if (result.type === "manual" && event.key !== "Enter") {
        snapshotOrigin(event.target);
        return;
      }
      if (result.type === "burst") {
        if (result.started) rollbackOrigin();
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (result.type === "scan") {
        event.preventDefault();
        event.stopImmediatePropagation();
        rollbackOrigin();
        hardwareScanRef.current(result.value);
      }
    };

    window.addEventListener("keydown", handleScannerCapture, true);
    return () => window.removeEventListener("keydown", handleScannerCapture, true);
  }, []);

  function playTone(kind: "success" | "error") {
    if (!soundEnabled) return;
    const AudioContextClass = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = kind === "success" ? 920 : 190;
    oscillator.type = kind === "success" ? "sine" : "square";
    gain.gain.setValueAtTime(0.045, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.08);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.08);
    oscillator.addEventListener("ended", () => void context.close());
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 5000);
  }

  function focusScan() {
    window.requestAnimationFrame(() => searchRef.current?.focus());
  }

  function scrollSelectedIntoView(id: string) {
    window.requestAnimationFrame(() => {
      rowRefs.current.get(id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  function selectByOffset(offset: number) {
    if (!cart.length) return;
    const currentIndex = Math.max(0, cart.findIndex((item) => item.id === selectedId));
    const nextIndex = Math.min(cart.length - 1, Math.max(0, currentIndex + offset));
    const nextId = cart[nextIndex].id;
    setSelectedId(nextId);
    scrollSelectedIntoView(nextId);
  }

  function selectBoundary(position: "first" | "last") {
    if (!cart.length) return;
    const nextId = position === "first" ? cart[0].id : cart.at(-1)!.id;
    setSelectedId(nextId);
    scrollSelectedIntoView(nextId);
  }

  function addProduct(product: Product, quantity = 1) {
    const safeQuantity = Math.min(999, Math.max(1, quantity));
    const existingProduct = cart.find((item) => item.barcode === product.barcode);
    setCart((current) => {
      const existing = current.find((item) => item.barcode === product.barcode);
      if (existing) {
        return current.map((item) =>
          item.barcode === product.barcode
            ? { ...item, qty: Math.min(999, item.qty + safeQuantity) }
            : item,
        );
      }
      return [...current, { ...product, qty: safeQuantity }];
    });
    setSelectedId(existingProduct?.id ?? product.id);
    setQuery("");
    setScanError("");
    setPendingMultiplier(1);
    setCatalogOpen(false);
    setAnnouncement(`${safeQuantity} ${product.name} ditambahkan.`);
    showToast(`${product.name} ditambahkan ×${safeQuantity}.`);
    playTone("success");
    scrollSelectedIntoView(product.id);
    focusScan();
  }

  function submitScanValue(rawValue: string) {
    const raw = rawValue.trim();
    const multiplierMatch = raw.match(/^(\d+)\*(.*)$/);
    const parsedMultiplier = multiplierMatch
      ? Math.min(999, Math.max(1, Number(multiplierMatch[1])))
      : pendingMultiplier;
    const term = (multiplierMatch ? multiplierMatch[2] : raw).trim();

    if (multiplierMatch && !term) {
      setPendingMultiplier(parsedMultiplier);
      setQuery("");
      setScanError("");
      setAnnouncement(`Pengali ${parsedMultiplier} aktif untuk scan berikutnya.`);
      focusScan();
      return;
    }

    if (!term) {
      setScanError("Scan barcode atau ketik nama produk terlebih dahulu.");
      playTone("error");
      return;
    }

    const normalized = term.toLocaleLowerCase("id-ID");
    const exact = products.find(
      (product) =>
        product.barcode === normalized ||
        product.name.toLocaleLowerCase("id-ID") === normalized,
    );
    const match =
      exact ??
      products.find(
        (product) =>
          product.name.toLocaleLowerCase("id-ID").includes(normalized) ||
          product.barcode.includes(normalized),
      );

    if (!match) {
      const message = `Produk “${term}” tidak ditemukan.`;
      setScanError(message);
      setAnnouncement(message);
      playTone("error");
      focusScan();
      return;
    }

    addProduct(match, parsedMultiplier);
  }

  function submitScan() {
    submitScanValue(query);
  }

  useEffect(() => {
    scannerStateRef.current = {
      query,
      receivedText,
      memberPhone,
      quantityBuffer,
      approvalCode,
      voucherCode,
    };
    hardwareScanRef.current = submitScanValue;
  });

  function changeQuantity(id: string, amount: number) {
    const currentItem = cart.find((item) => item.id === id);
    if (!currentItem) return;
    const nextQuantity = currentItem.qty + amount;
    if (nextQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, qty: Math.min(999, nextQuantity) } : item,
      ),
    );
    setSelectedId(id);
    setAnnouncement(`Jumlah ${currentItem.name} menjadi ${nextQuantity}.`);
  }

  function setSelectedQuantity(quantity: number) {
    const safeQuantity = Math.min(999, Math.max(1, quantity));
    const selected = cart.find((item) => item.id === selectedId);
    if (!selected) return;
    setCart((current) =>
      current.map((item) => (item.id === selectedId ? { ...item, qty: safeQuantity } : item)),
    );
    setQuantityBuffer("");
    setAnnouncement(`Jumlah ${selected.name} diatur menjadi ${safeQuantity}.`);
  }

  function removeItem(id: string) {
    setCart((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index < 0) return current;
      const item = current[index];
      setLastRemoved({ item, index });
      showToast(`${item.name} dihapus.`);
      setAnnouncement(`${item.name} dihapus. Tekan Ctrl+Z untuk mengembalikan.`);
      const next = current.filter((candidate) => candidate.id !== id);
      setSelectedId(next[Math.min(index, next.length - 1)]?.id ?? "");
      window.setTimeout(() => {
        setLastRemoved((removed) => (removed?.item.id === item.id ? null : removed));
      }, 5000);
      return next;
    });
  }

  function undoRemove() {
    if (!lastRemoved) return;
    setCart((current) => {
      if (current.some((item) => item.id === lastRemoved.item.id)) return current;
      const next = [...current];
      next.splice(Math.min(lastRemoved.index, next.length), 0, lastRemoved.item);
      return next;
    });
    setSelectedId(lastRemoved.item.id);
    setAnnouncement(`${lastRemoved.item.name} dikembalikan.`);
    setLastRemoved(null);
    setToast(null);
  }

  function holdTransaction() {
    if (!cart.length) {
      showToast("Belum ada transaksi untuk disimpan.");
      return;
    }
    setHeldTransactions((current) => [...current, cart]);
    setCart([]);
    setSelectedId("");
    setReceivedText("");
    setAnnouncement("Transaksi disimpan sementara.");
    showToast("Transaksi disimpan. Tekan F8 untuk memanggil kembali.");
    focusScan();
  }

  function recallTransaction() {
    const heldCart = heldTransactions.at(-1);
    if (!heldCart) {
      showToast("Tidak ada transaksi tersimpan.");
      return;
    }
    setCart(heldCart);
    setSelectedId(heldCart.at(-1)?.id ?? "");
    setHeldTransactions((current) => current.slice(0, -1));
    setAnnouncement("Transaksi tersimpan dipanggil kembali.");
    showToast("Transaksi berhasil dipanggil kembali.");
  }

  function selectPaymentMethod(method: PaymentMethod) {
    if (method !== paymentMethod) {
      if (method === "qris") setQrisConfirmed(false);
      if (method === "wallet") setWalletConfirmed(false);
      if (method === "debit" || method === "credit") setCardConfirmed(false);
      if (method === "voucher") setVoucherConfirmed(false);
    }
    setPaymentMethod(method);
    setPaymentMessage("");
    setVoucherError("");
  }

  function focusPaymentRequirement() {
    window.requestAnimationFrame(() => {
      if (paymentMethod === "cash") cashRef.current?.focus();
      else if (paymentMethod === "qris" || paymentMethod === "wallet") {
        digitalConfirmRef.current?.focus();
      } else if (paymentMethod === "debit" || paymentMethod === "credit") {
        approvalRef.current?.focus();
      } else voucherRef.current?.focus();
    });
  }

  function openReceiptOrCashWarning() {
    if (paymentMethod === "cash" && total > 0 && effectiveReceived > total * 10) {
      setDialog("cashWarning");
      return;
    }
    void persistCheckoutAndOpenReceipt();
  }

  async function persistCheckoutAndOpenReceipt() {
    if (!isApiConfigured) {
      setDialog("receipt");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    setPaymentMessage("");
    try {
      if (!checkoutKeyRef.current) checkoutKeyRef.current = crypto.randomUUID();
      const sale = await saveCheckout(
        {
          store_code: "MY-001",
          cashier_code: "KASIR03",
          member_phone: memberFound ? memberPhone.replace(/\D/g, "") : undefined,
          items: cart.map((item) => ({ barcode: item.barcode, quantity: item.qty })),
          payment: {
            method: paymentMethod,
            received_amount: paymentMethod === "cash" ? effectiveReceived : undefined,
            approval_code:
              paymentMethod === "debit" || paymentMethod === "credit"
                ? approvalCode.trim() || undefined
                : undefined,
            voucher_code: paymentMethod === "voucher" ? voucherCode.trim() : undefined,
            confirmed:
              paymentMethod === "qris"
                ? qrisConfirmed
                : paymentMethod === "wallet"
                  ? walletConfirmed
                  : paymentMethod === "debit" || paymentMethod === "credit"
                    ? cardConfirmed
                    : undefined,
          },
        },
        checkoutKeyRef.current,
      );
      setReceiptTransactionNo(sale.transaction_no);
      setDialog("receipt");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaksi gagal disimpan";
      setPaymentMessage(message);
      setAnnouncement(message);
      showToast(message);
    } finally {
      setIsSaving(false);
    }
  }

  function finishTransaction() {
    if (!cart.length) {
      setPaymentMessage("Keranjang masih kosong");
      setAnnouncement("Keranjang masih kosong.");
      focusScan();
      return;
    }
    if (!methodReady) {
      const message =
        paymentMethod === "cash"
          ? cashInputError || `Kurang ${money(total - received)}`
          : paymentMethod === "qris" || paymentMethod === "wallet"
          ? "Konfirmasi pembayaran diterima"
          : paymentMethod === "debit" || paymentMethod === "credit"
            ? "Konfirmasi transaksi EDC"
            : "Masukkan kode voucher yang valid";
      setPaymentMessage(message);
      setAnnouncement(message);
      focusPaymentRequirement();
      return;
    }
    if (paymentMethod === "cash" && !receivedText) setReceivedText(String(total));
    setPaymentMessage("");
    openReceiptOrCashWarning();
  }

  function confirmDigitalPayment() {
    // TODO: ganti konfirmasi manual ini dengan callback gateway pembayaran backend.
    if (paymentMethod === "qris") setQrisConfirmed(true);
    if (paymentMethod === "wallet") setWalletConfirmed(true);
    setPaymentMessage("");
    setAnnouncement(`${paymentMethod === "qris" ? "QRIS" : "E-Wallet"} diterima.`);
    window.requestAnimationFrame(() => payRef.current?.focus());
  }

  function confirmCardPayment() {
    setCardConfirmed(true);
    setPaymentMessage("");
    setAnnouncement("Transaksi EDC dikonfirmasi.");
    window.requestAnimationFrame(() => payRef.current?.focus());
  }

  async function confirmVoucher() {
    const normalizedCode = voucherCode.trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,24}$/.test(normalizedCode)) {
      setVoucherConfirmed(false);
      setVoucherError("Kode voucher minimal 4 karakter alfanumerik");
      setAnnouncement("Kode voucher tidak valid.");
      voucherRef.current?.focus();
      return;
    }
    if (!isApiConfigured) {
      setVoucherConfirmed(true);
      setVoucherError("");
      setPaymentMessage("");
      setAnnouncement("Voucher dikonfirmasi.");
      window.requestAnimationFrame(() => payRef.current?.focus());
      return;
    }
    try {
      const result = await validateVoucher(normalizedCode, total);
      setVoucherConfirmed(result.valid);
      setVoucherError(result.valid ? "" : result.message);
      setPaymentMessage("");
      setAnnouncement(result.message);
      if (result.valid) window.requestAnimationFrame(() => payRef.current?.focus());
      else voucherRef.current?.focus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Voucher gagal divalidasi";
      setVoucherConfirmed(false);
      setVoucherError(message);
      setAnnouncement(message);
      voucherRef.current?.focus();
    }
  }

  function resetTransaction(message: string) {
    setCart([]);
    setSelectedId("");
    setQuery("");
    setReceivedText("");
    setMemberPhone("");
    setMemberFound(false);
    setMember(null);
    setPaymentMethod("cash");
    setCashInputError("");
    setPresetIndex(-1);
    setQrisConfirmed(false);
    setWalletConfirmed(false);
    setApprovalCode("");
    setCardConfirmed(false);
    setVoucherCode("");
    setVoucherConfirmed(false);
    setVoucherError("");
    setPaymentMessage("");
    setPendingMultiplier(1);
    setReceiptTransactionNo("");
    checkoutKeyRef.current = "";
    setDialog(null);
    setAnnouncement(message);
    showToast(message);
    focusScan();
  }

  function finishReceipt(printReceipt: boolean) {
    if (printReceipt) window.print();
    resetTransaction(printReceipt ? "Struk dicetak. Transaksi baru siap." : "Transaksi baru siap.");
  }

  function confirmCancel() {
    resetTransaction("Transaksi dibatalkan.");
  }

  async function findMember() {
    const normalizedPhone = memberPhone.replace(/\D/g, "");
    if (!isApiConfigured) {
      const found = normalizedPhone === "081255449011";
      setMemberFound(found);
      setMember(
        found
          ? {
              id: "SM-772910",
              phone: normalizedPhone,
              full_name: "Budi Santoso",
              tier: "SILVER",
              points: 1_250,
            }
          : null,
      );
      const message = found ? "Member Budi Santoso ditemukan." : "Member tidak ditemukan.";
      setAnnouncement(message);
      showToast(message);
      return;
    }
    try {
      const foundMember = await lookupMember(normalizedPhone);
      setMember(foundMember);
      setMemberFound(true);
      const message = `Member ${foundMember.full_name} ditemukan.`;
      setAnnouncement(message);
      showToast(message);
    } catch {
      setMember(null);
      setMemberFound(false);
      setAnnouncement("Member tidak ditemukan.");
      showToast("Member tidak ditemukan.");
    }
  }

  function setTender(value: number) {
    setReceivedText(String(value));
    setCashInputError("");
    setPresetIndex(presets.indexOf(value));
    setAnnouncement(`Uang diterima ${money(value)}.`);
    window.requestAnimationFrame(() => cashRef.current?.focus());
  }

  function handleTableKeyDown(event: ReactKeyboardEvent<HTMLTableElement>) {
    if (event.ctrlKey && event.key.toLocaleLowerCase("id-ID") === "z") {
      event.preventDefault();
      undoRemove();
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      selectByOffset(event.key === "ArrowUp" ? -1 : 1);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      selectBoundary(event.key === "Home" ? "first" : "last");
      return;
    }
    if (event.key === "Delete" && selectedId) {
      event.preventDefault();
      removeItem(selectedId);
      return;
    }
    if (event.key === "+" || event.key === "=" || event.code === "NumpadAdd") {
      event.preventDefault();
      changeQuantity(selectedId, 1);
      return;
    }
    if (event.key === "-" || event.code === "NumpadSubtract") {
      event.preventDefault();
      changeQuantity(selectedId, -1);
      return;
    }
    if (/^\d$/.test(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      setQuantityBuffer((current) => `${current}${event.key}`.slice(0, 3));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (quantityBuffer) setSelectedQuantity(Number(quantityBuffer));
      else focusScan();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setQuantityBuffer("");
      focusScan();
    }
  }

  function handlePaymentKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    if (/^[1-6]$/.test(event.key)) {
      event.preventDefault();
      const nextIndex = Number(event.key) - 1;
      selectPaymentMethod(paymentMethods[nextIndex].id);
      window.requestAnimationFrame(() => paymentRefs.current[nextIndex]?.focus());
      return;
    }
    const horizontal = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const vertical = event.key === "ArrowDown" ? 3 : event.key === "ArrowUp" ? -3 : 0;
    const direction = horizontal || vertical;
    if (!direction) return;
    event.preventDefault();
    const nextIndex = (currentIndex + direction + paymentMethods.length) % paymentMethods.length;
    selectPaymentMethod(paymentMethods[nextIndex].id);
    window.requestAnimationFrame(() => paymentRefs.current[nextIndex]?.focus());
  }

  function handleCashKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && presets.length) {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const currentIndex = presetIndex >= 0 ? presetIndex : direction > 0 ? -1 : 0;
      const nextIndex = (currentIndex + direction + presets.length) % presets.length;
      setTender(presets[nextIndex]);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      finishTransaction();
    }
  }

  function handleScanKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      selectByOffset(event.key === "ArrowUp" ? -1 : 1);
      return;
    }
    if (event.altKey && event.key === "Delete") {
      event.preventDefault();
      if (selectedId) removeItem(selectedId);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      submitScan();
    }
  }

  function handleAppKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented) return;
    const nativeEvent = event.nativeEvent;
    if (/^F\d{1,2}$/.test(event.key)) event.preventDefault();

    if (dialog === "receipt") {
      if (event.key === "Enter") {
        event.preventDefault();
        finishReceipt(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        finishReceipt(false);
      }
      return;
    }
    if (dialog === "cashWarning") {
      if (event.key === "Enter") {
        event.preventDefault();
        void persistCheckoutAndOpenReceipt();
      } else if (event.key === "Escape") {
        event.preventDefault();
        setDialog(null);
        window.requestAnimationFrame(() => cashRef.current?.focus());
      }
      return;
    }
    if (dialog === "cancel") {
      if (event.key === "Enter") {
        event.preventDefault();
        confirmCancel();
      } else if (event.key === "Escape") {
        event.preventDefault();
        setDialog(null);
        focusScan();
      }
      return;
    }
    if (dialog) {
      if (event.key === "Escape") {
        event.preventDefault();
        setDialog(null);
        focusScan();
      }
      return;
    }
    if (catalogOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        setCatalogOpen(false);
        focusScan();
      }
      return;
    }

    if (matchesShortcut(nativeEvent, "help")) {
      event.preventDefault();
      setDialog("shortcuts");
      return;
    }
    if (matchesShortcut(nativeEvent, "catalog")) {
      event.preventDefault();
      setCatalogOpen(true);
      return;
    }
    if (matchesShortcut(nativeEvent, "member")) {
      event.preventDefault();
      memberRef.current?.focus();
      return;
    }
    if (matchesShortcut(nativeEvent, "discount")) {
      event.preventDefault();
      showToast("Diskon siap dihubungkan ke aturan promo backend.");
      return;
    }
    if (matchesShortcut(nativeEvent, "hold")) {
      event.preventDefault();
      holdTransaction();
      return;
    }
    if (matchesShortcut(nativeEvent, "recall")) {
      event.preventDefault();
      recallTransaction();
      return;
    }
    if (matchesShortcut(nativeEvent, "payment")) {
      event.preventDefault();
      finishTransaction();
      return;
    }
    if (matchesShortcut(nativeEvent, "lock")) {
      event.preventDefault();
      setDialog("lock");
      return;
    }

    const paymentIndex = paymentShortcutIds.findIndex((id) => matchesShortcut(nativeEvent, id));
    if (paymentIndex >= 0) {
      event.preventDefault();
      selectPaymentMethod(paymentMethods[paymentIndex].id);
      window.requestAnimationFrame(() => paymentRefs.current[paymentIndex]?.focus());
      return;
    }

    const target = event.target as HTMLElement;
    const isTyping = target.matches("input, textarea, [contenteditable='true']");
    if (!isTyping && event.ctrlKey && event.key.toLocaleLowerCase("id-ID") === "z") {
      event.preventDefault();
      undoRemove();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setQuantityBuffer("");
      focusScan();
    }
  }

  const selectedPayment = paymentMethods.find((method) => method.id === paymentMethod)!;
  const formattedTime = now
    ? new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Makassar",
      }).format(now)
    : "--.--";

  return (
    <div
      className="app-shell"
      onKeyDown={handleAppKeyDown}
      onFocusCapture={(event) => {
        const target = event.target as HTMLElement;
        if (target === searchRef.current) setFocusArea("scan");
        else if (target === cashRef.current) setFocusArea("cash");
        else if (target.closest(".cart-table")) setFocusArea("table");
        else if (target.closest(".payment-methods, .tender-section")) setFocusArea("payment");
        else setFocusArea(null);
      }}
    >
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">MY</div>
          <div className="brand-copy">
            <div className="brand-title-row">
              <strong>MYMARKET</strong>
            </div>
            <div className="store-line"><Store size={13} /><span>Samarinda Central</span></div>
          </div>
        </div>

        <div className="operator-line" aria-label={`Kasir Athasyahri, pukul ${formattedTime} WITA`}>
          <User size={14} aria-hidden="true" />
          <b>Athasyahri</b>
          <i aria-hidden="true" />
          <time>{formattedTime} WITA</time>
        </div>

        <div className="header-actions">
          <Link className="button quiet-button admin-link" href="/admin" title="Buka admin stok">
            <Boxes size={15} /><span>Admin</span>
          </Link>
          <button
            className="button quiet-button"
            onClick={() => setDialog("lock")}
            aria-keyshortcuts="F9"
            title={`${shortcutDisplay("lock")} — Kunci kasir`}
          >
            <LockKeyhole size={15} /><span>Kunci</span>
          </button>
          <button
            className="button logout-button"
            onClick={() => setDialog("logout")}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <main className="workspace">
        <section className="surface cart-panel" aria-label="Keranjang belanja">
          <div className="scan-area">
            <div className="scan-field">
              <Barcode className="scan-icon" size={22} aria-hidden="true" />
              <input
                ref={searchRef}
                className="scan-input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setScanError("");
                }}
                onKeyDown={handleScanKeyDown}
                onFocus={() => setFocusArea("scan")}
                tabIndex={1}
                autoFocus
                autoComplete="off"
                placeholder="Scan barcode atau ketik nama produk…"
                aria-label="Scan barcode atau cari produk"
                aria-invalid={Boolean(scanError)}
                aria-describedby={scanError ? "scan-feedback" : undefined}
              />
              {pendingMultiplier > 1 && <span className="multiplier-chip">×{pendingMultiplier}</span>}
              <div className="scan-actions">
                <button
                  className="scan-tool catalog-trigger"
                  onClick={() => setCatalogOpen(true)}
                  tabIndex={-1}
                  aria-label="Buka katalog"
                  aria-keyshortcuts="F2"
                  title={`${shortcutDisplay("catalog")} — Buka katalog`}
                >
                  <Search size={15} /><kbd>{shortcutRegistry.catalog.label}</kbd>
                </button>
                <kbd>Enter</kbd>
              </div>
            </div>
            <div className={`scan-feedback ${scanError ? "error" : ""}`} id="scan-feedback">
              {scanError ? (
                <><AlertCircle size={13} />{scanError}</>
              ) : query && scanSuggestion ? (
                <><Check size={13} />Enter: {scanSuggestion.name}</>
              ) : pendingMultiplier > 1 ? (
                <>Pengali ×{pendingMultiplier} aktif untuk scan berikutnya.</>
              ) : null}
            </div>
          </div>

          <div className="table-scroll">
            <table
              className="cart-table"
              role="grid"
              tabIndex={2}
              aria-label="Daftar produk. Gunakan panah atas dan bawah untuk memilih."
              aria-rowcount={cart.length + 1}
              onKeyDown={handleTableKeyDown}
              onFocus={() => {
                setFocusArea("table");
                if (!selectedId && cart.length) setSelectedId(cart[0].id);
              }}
            >
              <thead>
                <tr role="row">
                  <th className="center-cell" role="columnheader">No.</th>
                  <th role="columnheader">Produk</th>
                  <th className="number-cell" role="columnheader">Harga</th>
                  <th className="center-cell" role="columnheader">Qty</th>
                  <th className="number-cell" role="columnheader">Subtotal</th>
                  <th className="center-cell" role="columnheader">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => {
                  const selected = item.id === selectedId;
                  return (
                    <tr
                      key={item.id}
                      ref={(node) => {
                        if (node) rowRefs.current.set(item.id, node);
                        else rowRefs.current.delete(item.id);
                      }}
                      role="row"
                      aria-selected={selected}
                      className={selected ? "selected-row" : ""}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <td className="center-cell row-number" role="gridcell">{index + 1}</td>
                      <td className="product-cell" role="gridcell">
                        <b>{item.name}</b>
                        {selected && <small>{item.barcode}</small>}
                      </td>
                      <td className="number-cell money-cell" role="gridcell">{money(item.price)}</td>
                      <td role="gridcell">
                        <div className="stepper" aria-label={`Jumlah ${item.name}`}>
                          <button
                            tabIndex={-1}
                            aria-label={`Kurangi ${item.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              changeQuantity(item.id, -1);
                            }}
                          ><Minus size={14} /></button>
                          <b>{item.qty}</b>
                          <button
                            tabIndex={-1}
                            aria-label={`Tambah ${item.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              changeQuantity(item.id, 1);
                            }}
                          ><Plus size={14} /></button>
                        </div>
                      </td>
                      <td className="number-cell subtotal-cell" role="gridcell">{money(item.price * item.qty)}</td>
                      <td className="center-cell" role="gridcell">
                        <button
                          className="icon-button delete-button"
                          tabIndex={-1}
                          aria-label={`Hapus ${item.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeItem(item.id);
                          }}
                        ><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!cart.length && (
              <div className="empty-cart">
                <PackageSearch size={28} />
                <h2>Keranjang masih kosong</h2>
                <p>Scan barcode atau tekan F2 untuk membuka katalog.</p>
              </div>
            )}
            {quantityBuffer && (
              <div className="quantity-buffer" aria-live="polite">
                Qty <b>{quantityBuffer}</b> · Enter untuk simpan
              </div>
            )}
          </div>

          <div className="cart-toolbar" aria-label="Aksi transaksi tambahan">
            <div className="function-grid">
              <FunctionButton
                shortcutId="discount"
                label="Diskon"
                icon={Percent}
                onClick={() => showToast("Diskon siap dihubungkan ke aturan promo backend.")}
              />
              <FunctionButton
                id="recall-button"
                shortcutId="recall"
                label="Recall"
                badge={heldTransactions.length || undefined}
                icon={RotateCcw}
                onClick={recallTransaction}
              />
            </div>
          </div>
        </section>

        <section className="surface payment-panel" aria-label="Pembayaran">
          <div className="total-display">
            <div className="total-label-row">
              <span><ReceiptText size={15} />Total belanja</span>
              <b>{totalQty} item</b>
            </div>
            <div className="total-number"><span>Rp</span><strong>{integer.format(total)}</strong></div>
            <dl className="summary-grid">
              <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
              {discount !== 0 && <div><dt>Diskon</dt><dd>{money(discount)}</dd></div>}
              {tax !== 0 && <div><dt>PPN</dt><dd>{money(tax)}</dd></div>}
              {rounding !== 0 && <div><dt>Pembulatan</dt><dd>{money(rounding)}</dd></div>}
            </dl>
          </div>

          <div className="payment-content">
            <section className="payment-section member-section" aria-labelledby="member-title">
              <div className="section-heading">
                <span id="member-title"><User size={14} />Pelanggan / member</span>
                <kbd>{shortcutRegistry.member.label}</kbd>
              </div>
              <div className="member-search">
                <Smartphone size={14} aria-hidden="true" />
                <input
                  id="member-phone"
                  ref={memberRef}
                  value={memberPhone}
                  onChange={(event) => setMemberPhone(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      findMember();
                    }
                  }}
                  tabIndex={3}
                  inputMode="numeric"
                  placeholder="Nomor HP member"
                  aria-label="Nomor HP member"
                />
                <button tabIndex={-1} onClick={findMember} aria-label="Cari member" title="Cari member">
                  <Search size={15} />
                </button>
              </div>
              {memberFound && member ? (
                <div className="member-card">
                  <div className="member-icon"><Crown size={15} /></div>
                  <div className="member-copy">
                    <div><b>{member.full_name}</b><span>{member.tier}</span></div>
                    <small>ID {member.id.slice(0, 8).toUpperCase()}</small>
                  </div>
                  <div className="points">
                    <small>Poin {integer.format(member.points)}</small>
                    <b>+{integer.format(estimatedPoints)} estimasi</b>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="payment-section method-section" aria-labelledby="payment-method-title">
              <div className="section-heading">
                <span id="payment-method-title"><Wallet size={14} />Metode pembayaran</span>
              </div>
              <div className="payment-methods" role="radiogroup" aria-label="Metode pembayaran">
                {paymentMethods.map((method, index) => {
                  const Icon = method.icon;
                  const active = method.id === paymentMethod;
                  return (
                    <button
                      key={method.id}
                      ref={(node) => { paymentRefs.current[index] = node; }}
                      className={`payment-method ${active ? "active" : ""}`}
                      role="radio"
                      aria-checked={active}
                      aria-keyshortcuts={`Control+Shift+${index + 1}`}
                      tabIndex={active ? 4 : -1}
                      onKeyDown={(event) => handlePaymentKeyDown(event, index)}
                      onFocus={() => setFocusArea("payment")}
                      onClick={() => selectPaymentMethod(method.id)}
                    >
                      <Icon size={19} />
                      <b>{method.label}</b>
                      <small>{method.helper}</small>
                      <kbd>{shortcutRegistry[paymentShortcutIds[index]].keycap}</kbd>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="payment-section tender-section" aria-live="polite">
              {paymentMethod === "cash" ? (
                <>
                  <div className="section-heading">
                    <span><Banknote size={14} />Uang diterima</span>
                  </div>
                  <label className={`cash-input ${cashShort || cashInputError ? "error" : ""}`}>
                    <span>Rp</span>
                    <input
                      ref={cashRef}
                      value={receivedText ? integer.format(received) : ""}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, "");
                        if (digits.length > 13) {
                          setCashInputError("Maksimal 13 digit");
                          return;
                        }
                        setReceivedText(digits);
                        setCashInputError("");
                        setPaymentMessage("");
                        setPresetIndex(-1);
                      }}
                      onKeyDown={handleCashKeyDown}
                      onFocus={() => setFocusArea("cash")}
                      tabIndex={5}
                      inputMode="numeric"
                      aria-label="Uang diterima"
                      aria-invalid={cashShort || Boolean(cashInputError)}
                    />
                  </label>
                  {(cashShort || cashInputError) && (
                    <p className="field-error">{cashInputError || `Kurang ${money(total - received)}`}</p>
                  )}
                  <div className="cash-presets" aria-label="Nominal cepat">
                    {presets.map((value, index) => (
                      <button
                        key={`${value}-${index}`}
                        className={presetIndex === index || received === value ? "active" : ""}
                        onClick={() => setTender(value)}
                      >
                        <span>{index === 0 ? "Pas" : `${integer.format(value / 1000)}rb`}</span>
                      </button>
                    ))}
                  </div>
                  <div className={`change-card ${cashShort ? "short" : ""}`}>
                    <div className="change-icon">{!cashShort ? <Coins size={16} /> : <AlertCircle size={16} />}</div>
                    <span><small>{!cashShort ? "Kembalian" : "Masih kurang"}</small><strong>{money(Math.abs(change))}</strong></span>
                  </div>
                </>
              ) : paymentMethod === "qris" || paymentMethod === "wallet" ? (
                <div className={`digital-payment-card ${methodReady ? "confirmed" : ""}`}>
                  <div className="digital-icon"><selectedPayment.icon size={22} /></div>
                  <div>
                    <small>{selectedPayment.label}</small>
                    <b>{methodReady ? "Pembayaran diterima" : "Menunggu pembayaran"}</b>
                    <p>Konfirmasi manual sementara integrasi gateway disiapkan.</p>
                  </div>
                  <button
                    ref={digitalConfirmRef}
                    className="button confirm-payment-button"
                    onClick={confirmDigitalPayment}
                    onFocus={() => setFocusArea("payment")}
                    tabIndex={5}
                  >
                    <Check size={15} />Konfirmasi diterima
                  </button>
                </div>
              ) : paymentMethod === "debit" || paymentMethod === "credit" ? (
                <div className="method-confirm-card">
                  <label className="method-confirm-field">
                    <span>No. approval EDC <small>Opsional</small></span>
                    <input
                      ref={approvalRef}
                      value={approvalCode}
                      onChange={(event) => {
                        setApprovalCode(event.target.value.slice(0, 24));
                        setCardConfirmed(false);
                        setPaymentMessage("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          confirmCardPayment();
                        }
                      }}
                      onFocus={() => setFocusArea("payment")}
                      tabIndex={5}
                      placeholder="Ketik nomor atau Enter untuk konfirmasi"
                      aria-label="Nomor approval EDC"
                    />
                  </label>
                  <span className={`method-status ${cardConfirmed ? "confirmed" : ""}`}>
                    {cardConfirmed ? <Check size={14} /> : <Landmark size={14} />}
                    {cardConfirmed ? "EDC dikonfirmasi" : "Menunggu konfirmasi EDC"}
                  </span>
                </div>
              ) : (
                <div className="method-confirm-card">
                  <label className={`method-confirm-field ${voucherError ? "error" : ""}`}>
                    <span>Kode voucher <small>Wajib</small></span>
                    <input
                      ref={voucherRef}
                      value={voucherCode}
                      onChange={(event) => {
                        setVoucherCode(event.target.value.toUpperCase().slice(0, 24));
                        setVoucherConfirmed(false);
                        setVoucherError("");
                        setPaymentMessage("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          confirmVoucher();
                        }
                      }}
                      onFocus={() => setFocusArea("payment")}
                      tabIndex={5}
                      placeholder="Masukkan kode voucher"
                      aria-label="Kode voucher"
                      aria-invalid={Boolean(voucherError)}
                    />
                  </label>
                  <span className={`method-status ${voucherConfirmed ? "confirmed" : ""}`}>
                    {voucherConfirmed ? <Check size={14} /> : <Ticket size={14} />}
                    {voucherError || (voucherConfirmed ? "Voucher valid" : "Enter untuk validasi")}
                  </span>
                </div>
              )}
            </section>
          </div>

          <div className="checkout-actions">
            <button
              id="checkout-button"
              ref={payRef}
              className="button checkout-button"
              onClick={finishTransaction}
              disabled={!canCheckout || isSaving}
              tabIndex={6}
              aria-describedby={checkoutReason ? "checkout-reason" : undefined}
              aria-keyshortcuts="F12"
            >
              <span><CircleCheck size={19} /><b>{isSaving ? "Menyimpan..." : "Bayar / selesaikan"}</b></span>
              <span><kbd>{shortcutRegistry.payment.label}</kbd><ArrowRight size={17} /></span>
            </button>
            {checkoutReason && <p id="checkout-reason" className="checkout-reason visible">{checkoutReason}</p>}
            <div className="secondary-actions">
              <button
                id="hold-button"
                className="button quiet-button"
                onClick={holdTransaction}
                aria-keyshortcuts="F7"
              >
                <Pause size={15} /><span>Simpan / hold</span><kbd>{shortcutRegistry.hold.label}</kbd>
              </button>
              <button className="button danger-button" onClick={() => setDialog("cancel")}>
                <Ban size={15} /><span>Batalkan</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="statusbar">
        <div className="status-meta">
          <span>No. transaksi</span><b className="transaction-id">{receiptTransactionNo || "Transaksi baru"}</b><i />
          <span>Shift <b>Pagi</b></span><i />
          <span className="sync-status"><CloudUpload size={13} />Tersinkronisasi</span>
        </div>
        <div className="focus-hint" aria-live="polite">{contextualHint}</div>
        <div className="footer-tools">
          <span className="footer-version">POS v4.2</span>
          <button
            className="sound-toggle"
            onClick={() => setSoundEnabled((current) => !current)}
            aria-label={soundEnabled ? "Matikan suara scan" : "Nyalakan suara scan"}
            title={soundEnabled ? "Matikan suara scan" : "Nyalakan suara scan"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button className="help-button" onClick={() => setDialog("shortcuts")} aria-keyshortcuts="F1">
            <kbd>{shortcutRegistry.help.label}</kbd><span>Bantuan</span>
          </button>
        </div>
      </footer>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement} Total {money(total)}.
      </div>

      {catalogOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={() => { setCatalogOpen(false); focusScan(); }}>
          <section
            className="catalog-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <div className="modal-header">
              <div>
                <span className="modal-icon"><PackageSearch size={19} /></span>
                <span><small>Katalog produk</small><h2 id="catalog-title">Pilih produk</h2></span>
              </div>
              <button className="icon-button" onClick={() => { setCatalogOpen(false); focusScan(); }} aria-label="Tutup katalog"><X size={18} /></button>
            </div>
            <label className="catalog-search">
              <Search size={16} />
              <input
                ref={catalogSearchRef}
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredProducts[0]) {
                    event.preventDefault();
                    addProduct(filteredProducts[0]);
                  }
                }}
                placeholder="Cari nama, barcode, atau kategori…"
                aria-label="Cari katalog"
              />
              <kbd>Esc</kbd>
            </label>
            <div className="catalog-results">
              {filteredProducts.map((product) => {
                const count = cart.find((item) => item.id === product.id)?.qty ?? 0;
                return (
                  <button className="catalog-item" key={product.id} onClick={() => addProduct(product)}>
                    <span className="product-monogram">{product.name.slice(0, 2).toUpperCase()}</span>
                    <span className="catalog-item-copy"><b>{product.name}</b><small>{product.barcode} · {product.category}</small></span>
                    <strong>{money(product.price)}</strong>
                    {count > 0 && <span className="in-cart">{count} di keranjang</span>}
                    <span className="round-add"><Plus size={15} /></span>
                  </button>
                );
              })}
              {!filteredProducts.length && <div className="no-results"><PackageSearch size={30} /><b>Produk tidak ditemukan</b><span>Coba kata kunci lain.</span></div>}
            </div>
          </section>
        </div>
      )}

      {dialog === "shortcuts" && (
        <DialogShell label="Bantuan pintasan" onClose={() => { setDialog(null); focusScan(); }}>
          <div className="neutral-orb"><HelpCircle size={27} /></div>
          <span className="eyebrow">Keyboard-first</span>
          <h2>Pintasan kasir</h2>
          <div className="shortcut-list">
            {helpShortcuts.map((id) => (
              <div key={id}><kbd>{shortcutDisplay(id)}</kbd><span>{shortcutRegistry[id].description}</span></div>
            ))}
          </div>
          <button className="button primary-button dialog-primary" onClick={() => { setDialog(null); focusScan(); }}>Tutup</button>
        </DialogShell>
      )}

      {dialog === "receipt" && (
        <DialogShell label="Transaksi berhasil" onClose={() => finishReceipt(false)}>
          <div className="success-orb"><CircleCheck size={29} /></div>
          <span className="eyebrow">Pembayaran berhasil</span>
          <h2>{money(total)}</h2>
          <p>Transaksi selesai dan siap dicetak.</p>
          <div className="receipt-summary">
            <span><small>Metode</small><b>{selectedPayment.label}</b></span>
            {receiptTransactionNo && <span><small>No. transaksi</small><b>{receiptTransactionNo}</b></span>}
            <span><small>Kembalian</small><b>{paymentMethod === "cash" ? money(Math.max(0, change)) : "—"}</b></span>
          </div>
          <button className="button primary-button dialog-primary" onClick={() => finishReceipt(true)}><Printer size={16} />Cetak struk <kbd>Enter</kbd></button>
          <button className="dialog-close" onClick={() => finishReceipt(false)}>Lewati cetak <kbd>Esc</kbd></button>
        </DialogShell>
      )}

      {dialog === "cashWarning" && (
        <DialogShell
          label="Konfirmasi nominal besar"
          onClose={() => {
            setDialog(null);
            window.requestAnimationFrame(() => cashRef.current?.focus());
          }}
        >
          <div className="warning-orb"><AlertCircle size={27} /></div>
          <span className="eyebrow">Periksa uang diterima</span>
          <h2>{money(effectiveReceived)}</h2>
          <p>Nominal lebih dari 10× total belanja. Pastikan tidak ada salah input.</p>
          <button className="button primary-button dialog-primary" onClick={() => void persistCheckoutAndOpenReceipt()} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Lanjutkan pembayaran"} <kbd>Enter</kbd>
          </button>
          <button
            className="dialog-close"
            onClick={() => {
              setDialog(null);
              window.requestAnimationFrame(() => cashRef.current?.focus());
            }}
          >
            Periksa kembali <kbd>Esc</kbd>
          </button>
        </DialogShell>
      )}

      {dialog === "cancel" && (
        <DialogShell label="Batalkan transaksi" onClose={() => { setDialog(null); focusScan(); }}>
          <div className="warning-orb"><AlertCircle size={27} /></div>
          <span className="eyebrow">Konfirmasi</span>
          <h2>Batalkan transaksi?</h2>
          <p>Seluruh isi keranjang saat ini akan dikosongkan.</p>
          <button className="button danger-solid dialog-primary" onClick={confirmCancel}>Ya, batalkan <kbd>Enter</kbd></button>
          <button className="dialog-close" onClick={() => { setDialog(null); focusScan(); }}>Kembali <kbd>Esc</kbd></button>
        </DialogShell>
      )}

      {dialog === "lock" && (
        <DialogShell label="Kasir terkunci" onClose={() => { setDialog(null); focusScan(); }}>
          <div className="neutral-orb"><LockKeyhole size={27} /></div>
          <span className="eyebrow">Keamanan kasir</span><h2>Layar dikunci</h2>
          <p>Simulasi penguncian aktif. Integrasikan autentikasi PIN melalui backend.</p>
          <button className="button primary-button dialog-primary" onClick={() => { setDialog(null); focusScan(); }}>Buka kembali</button>
        </DialogShell>
      )}

      {dialog === "logout" && (
        <DialogShell label="Logout kasir" onClose={() => { setDialog(null); focusScan(); }}>
          <div className="neutral-orb"><LogOut size={27} /></div>
          <span className="eyebrow">Akhiri sesi</span><h2>Logout kasir?</h2>
          <p>Fungsi ini menunggu endpoint autentikasi dari backend.</p>
          <button className="button quiet-button dialog-primary" onClick={() => setDialog(null)}>Tutup</button>
        </DialogShell>
      )}

      {toast && (
        <div className="toast" role="status">
          <CircleCheck size={16} /><span>{toast}</span>
          {lastRemoved && <button onClick={undoRemove}><Undo2 size={13} />Urungkan</button>}
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Tutup notifikasi"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

function DialogShell({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section className="dialog-card" role="dialog" aria-modal="true" aria-label={label} onMouseDown={(event) => event.stopPropagation()}>
        {children}
      </section>
    </div>
  );
}

function FunctionButton({
  id,
  shortcutId,
  label,
  badge,
  icon: Icon,
  onClick,
}: {
  id?: string;
  shortcutId: ShortcutId;
  label: string;
  badge?: number;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button id={id} className="function-button" onClick={onClick} title={shortcutDisplay(shortcutId)}>
      <Icon size={15} /><span>{label}</span>
      {badge ? <b className="function-badge">{badge}</b> : null}
      <kbd>{shortcutRegistry[shortcutId].label}</kbd>
    </button>
  );
}
