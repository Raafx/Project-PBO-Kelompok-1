"use client";

import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Ban,
  Barcode,
  Calculator,
  Check,
  ChevronDown,
  CircleCheck,
  Coins,
  CreditCard,
  Crown,
  Ellipsis,
  Grid3X3,
  HelpCircle,
  Landmark,
  LockKeyhole,
  LogOut,
  Maximize,
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
import Image from "next/image";
import {
  useCallback,
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
  addShiftCashMovement,
  closeCashierShift,
  deleteHold,
  loadCashierSales,
  loadCurrentShift,
  loadHolds,
  loadPosConfig,
  loadProducts,
  logoutAccount,
  lookupMember,
  openCashierShift,
  saveCheckout,
  saveHold,
  updateLiveTransaction,
  validateVoucher,
  voidSale,
  type ApiMember,
  type LiveTransactionHeartbeat,
  type LiveTransactionStatus,
  type SaleDetail,
  type ShiftSummary,
  type PosConfig,
  type CheckoutResponse,
} from "./api";
import { readSessionUser } from "./access";
import SearchableSelect from "./SearchableSelect";

type Product = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  location: string;
  price: number;
  stock: number;
  image_url: string | null;
};

type CartItem = Product & { qty: number };
type PaymentMethod =
  | "cash"
  | "qris"
  | "edc"
  | "debit"
  | "credit"
  | "wallet"
  | "voucher";
type DialogName =
  | "receipt"
  | "cashWarning"
  | "cancel"
  | "lock"
  | "logout"
  | "shortcuts"
  | "shift"
  | "history"
  | "void"
  | null;
type FocusArea = "scan" | "table" | "payment" | "cash" | null;

const fallbackProducts: Product[] = [
  {
    id: "ekomart-cerelac",
    barcode: "8997000400001",
    name: "Nestle Cerelac Mixed Fruits & Wheat 400g",
    category: "Makanan Bayi",
    location: "Rak B-01",
    price: 72900,
    stock: 32,
    image_url: "/ekomart/products/01.jpg",
  },
  {
    id: "ekomart-pumpkin-mix",
    barcode: "8997000400002",
    name: "Great Value Pumpkin Spice Bread & Muffin Mix 425g",
    category: "Bahan Kue",
    location: "Rak K-01",
    price: 48900,
    stock: 18,
    image_url: "/ekomart/products/02.jpg",
  },
  {
    id: "ekomart-aptamil",
    barcode: "8997000400003",
    name: "Aptamil Gold+ Stage 1 Infant Formula 900g",
    category: "Susu Formula",
    location: "Rak B-02",
    price: 329000,
    stock: 6,
    image_url: "/ekomart/products/03.jpg",
  },
  {
    id: "ekomart-apple-juice",
    barcode: "8997000400004",
    name: "Market Pantry 100% Apple Juice 1.89L",
    category: "Minuman",
    location: "Chiller C-01",
    price: 69900,
    stock: 36,
    image_url: "/ekomart/products/04.jpg",
  },
  {
    id: "ekomart-mandarin",
    barcode: "8997000400005",
    name: "Jeruk Mandarin Segar 1kg",
    category: "Buah & Sayur",
    location: "Fresh F-01",
    price: 32900,
    stock: 42,
    image_url: "/ekomart/products/05.jpg",
  },
  {
    id: "ekomart-sauces",
    barcode: "8997000400006",
    name: "Assorted Cooking Sauce Pouch 350ml",
    category: "Saus & Bumbu",
    location: "Rak S-01",
    price: 35900,
    stock: 24,
    image_url: "/ekomart/products/06.jpg",
  },
  {
    id: "ekomart-chocos",
    barcode: "8997000400007",
    name: "Kellogg's Multigrain Chocos 375g",
    category: "Sarapan & Sereal",
    location: "Rak C-01",
    price: 59900,
    stock: 28,
    image_url: "/ekomart/products/07.jpg",
  },
  {
    id: "ekomart-hunter-mix",
    barcode: "8997000400008",
    name: "Gourmet Hunter Mix Nuts 652g",
    category: "Kacang & Camilan",
    location: "Rak N-01",
    price: 119000,
    stock: 20,
    image_url: "/ekomart/products/08.jpg",
  },
  {
    id: "ekomart-cantaloupe",
    barcode: "8997000400009",
    name: "Melon Cantaloupe Segar 1kg",
    category: "Buah & Sayur",
    location: "Fresh F-02",
    price: 45000,
    stock: 16,
    image_url: "/ekomart/products/09.jpg",
  },
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
  { id: "qris", label: "QRIS", helper: "No. approval", icon: QrCode },
  { id: "edc", label: "EDC", helper: "Debit / Kredit", icon: CreditCard },
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
  return [...new Set([total, nextMultiple(50000), nextMultiple(100000)])].slice(
    0,
    4,
  );
}

export default function PosPage() {
  const [sessionUser] = useState(() => readSessionUser());
  const cashierCode = sessionUser?.employee_code || "";
  const cashierName = sessionUser?.full_name || "Kasir";
  const cashierRole = sessionUser?.role_name || "Kasir";
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [posConfig, setPosConfig] = useState<PosConfig>({
    store_name: "MYMARKET Samarinda Central",
    store_address: "Samarinda, Kalimantan Timur",
    logo_url: null,
    payment_methods: ["cash", "qris", "edc"],
    tax_rate: 0,
    tax_included: true,
    receipt_paper: "80",
    receipt_footer: "Terima kasih sudah belanja di MYMARKET",
  });
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [selectedId, setSelectedId] = useState(initialCart.at(-1)?.id ?? "");
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
  const [heldTransactions, setHeldTransactions] = useState<SaleDetail[]>([]);
  const [cashierHistory, setCashierHistory] = useState<SaleDetail[]>([]);
  const [shift, setShift] = useState<ShiftSummary | null>(null);
  const [openingCash, setOpeningCash] = useState("500000");
  const [closingCash, setClosingCash] = useState("");
  const [cashMovement, setCashMovement] = useState({
    movement_type: "cash_out" as "cash_in" | "cash_out",
    category: "Operasional",
    amount: "",
    note: "",
  });
  const [voidTarget, setVoidTarget] = useState("");
  const [supervisorCode, setSupervisorCode] = useState("");
  const [supervisorPin, setSupervisorPin] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const [qrisConfirmed, setQrisConfirmed] = useState(false);
  const [walletConfirmed, setWalletConfirmed] = useState(false);
  const [approvalCode, setApprovalCode] = useState("");
  const [edcCardType, setEdcCardType] = useState<"debit" | "credit">("debit");
  const [edcCardNumber, setEdcCardNumber] = useState("");
  const [cardConfirmed, setCardConfirmed] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherConfirmed, setVoucherConfirmed] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [dialog, setDialog] = useState<DialogName>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<{
    item: CartItem;
    index: number;
  } | null>(null);
  const [quantityBuffer, setQuantityBuffer] = useState("");
  const [announcement, setAnnouncement] = useState("Kasir siap digunakan.");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [focusArea, setFocusArea] = useState<FocusArea>("scan");
  const [isSaving, setIsSaving] = useState(false);
  const [receiptTransactionNo, setReceiptTransactionNo] = useState("");
  const [receiptSummary, setReceiptSummary] = useState<CheckoutResponse | null>(
    null,
  );
  const [liveSessionId, setLiveSessionId] = useState(() =>
    isApiConfigured ? crypto.randomUUID() : "",
  );

  const searchRef = useRef<HTMLInputElement>(null);
  const memberRef = useRef<HTMLInputElement>(null);
  const cashRef = useRef<HTMLInputElement>(null);
  const payRef = useRef<HTMLButtonElement>(null);
  const digitalConfirmRef = useRef<HTMLButtonElement>(null);
  const approvalRef = useRef<HTMLInputElement>(null);
  const cardNumberRef = useRef<HTMLInputElement>(null);
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
  const tax = posConfig.tax_rate
    ? posConfig.tax_included
      ? Math.floor(
          ((subtotal - discount) * posConfig.tax_rate) /
            (100 + posConfig.tax_rate),
        )
      : Math.floor(((subtotal - discount) * posConfig.tax_rate) / 100)
    : 0;
  const rounding = 0;
  const total =
    subtotal - discount + (posConfig.tax_included ? 0 : tax) + rounding;
  const totalQty = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart],
  );
  const received = Number(receivedText || 0);
  const effectiveReceived = receivedText ? received : total;
  const change = effectiveReceived - total;
  const cashShort = Boolean(receivedText) && received < total;
  const methodReady =
    paymentMethod === "cash"
      ? !cashShort && !cashInputError
      : paymentMethod === "qris"
        ? qrisConfirmed && approvalCode.trim().length >= 4
        : paymentMethod === "edc"
          ? cardConfirmed &&
            /^\d{12,19}$/.test(edcCardNumber) &&
            approvalCode.trim().length >= 4
          : paymentMethod === "wallet"
            ? walletConfirmed
            : paymentMethod === "debit" || paymentMethod === "credit"
              ? cardConfirmed
              : voucherConfirmed;
  const checkoutReason =
    cart.length === 0 ? "Keranjang masih kosong" : paymentMessage;
  const canCheckout = cart.length > 0 && methodReady;
  const estimatedPoints = Math.floor(total / 10000);
  const presets = useMemo(() => tenderPresets(total), [total]);
  const availablePaymentMethods = useMemo(() => {
    const configured = paymentMethods.filter((method) =>
      posConfig.payment_methods.includes(method.id),
    );
    return configured.length ? configured : paymentMethods;
  }, [posConfig.payment_methods]);
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

  const visibleProducts = useMemo(() => {
    const normalized = query
      .trim()
      .replace(/^\d+\*/, "")
      .toLocaleLowerCase("id-ID");
    return products.filter((product) => {
      const matchesQuery =
        !normalized ||
        product.name.toLocaleLowerCase("id-ID").includes(normalized) ||
        product.barcode.includes(normalized);
      return matchesQuery;
    });
  }, [products, query]);

  const scanSuggestion = useMemo(() => {
    const raw = query
      .trim()
      .replace(/^\d+\*/, "")
      .toLocaleLowerCase("id-ID");
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

  const currentLiveStatus = useCallback((): LiveTransactionStatus => {
    if (dialog === "receipt" && receiptTransactionNo) return "completed";
    if (isSaving) return "processing";
    if (!cart.length) return "ready";
    const paymentStarted =
      focusArea === "payment" ||
      focusArea === "cash" ||
      paymentMethod !== "cash" ||
      Boolean(receivedText);
    return paymentStarted ? "payment" : "shopping";
  }, [
    cart.length,
    dialog,
    focusArea,
    isSaving,
    paymentMethod,
    receiptTransactionNo,
    receivedText,
  ]);

  const liveHeartbeatPayload = useCallback(
    (
      status: LiveTransactionStatus = currentLiveStatus(),
      transactionNo = receiptTransactionNo,
    ): LiveTransactionHeartbeat => {
      const actions: Record<LiveTransactionStatus, string> = {
        ready: "Siap melayani pelanggan",
        shopping: "Memindai dan menyiapkan produk",
        payment: methodReady
          ? "Pembayaran siap diselesaikan"
          : "Menunggu pembayaran",
        processing: "Menyimpan transaksi",
        completed: "Transaksi selesai",
        held: "Transaksi disimpan sementara",
        cancelled: "Transaksi dibatalkan",
      };
      return {
        session_id: liveSessionId,
        store_code: "MY-001",
        cashier_code: cashierCode,
        status,
        items: cart.map((item) => ({
          barcode: item.barcode,
          quantity: item.qty,
        })),
        payment_method: cart.length ? paymentMethod : undefined,
        payment_ready: cart.length > 0 && methodReady,
        member_phone: memberFound ? memberPhone.replace(/\D/g, "") : undefined,
        current_action: actions[status],
        transaction_no: transactionNo || undefined,
      };
    },
    [
      cart,
      cashierCode,
      currentLiveStatus,
      liveSessionId,
      memberFound,
      memberPhone,
      methodReady,
      paymentMethod,
      receiptTransactionNo,
    ],
  );

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    const frame = window.requestAnimationFrame(updateClock);
    const timer = window.setInterval(updateClock, 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  const refreshCashierData = useCallback(async () => {
    if (!isApiConfigured || !cashierCode) return;
    try {
      const [nextHolds, nextShift, nextHistory] = await Promise.all([
        loadHolds(),
        loadCurrentShift(cashierCode),
        loadCashierSales(cashierCode),
      ]);
      setHeldTransactions(nextHolds);
      setShift(nextShift);
      setCashierHistory(nextHistory);
    } catch {
      setAnnouncement("Data shift atau riwayat belum bisa dimuat.");
    }
  }, [cashierCode]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void refreshCashierData());
    return () => window.cancelAnimationFrame(frame);
  }, [refreshCashierData]);

  useEffect(() => {
    if (!isApiConfigured) return;
    const controller = new AbortController();
    Promise.all([
      loadProducts(controller.signal),
      loadPosConfig(controller.signal),
    ])
      .then(([items, config]) => {
        if (items.length) setProducts(items);
        setPosConfig(config);
        setPaymentMethod((current) =>
          config.payment_methods.includes(current)
            ? current
            : config.payment_methods[0] || "cash",
        );
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setAnnouncement(
          "Backend tidak terhubung; katalog lokal tetap digunakan.",
        );
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isApiConfigured || !liveSessionId || !cashierCode) return;
    const send = () => {
      void updateLiveTransaction(liveHeartbeatPayload()).catch(() => undefined);
    };
    const debounce = window.setTimeout(send, 300);
    const heartbeat = window.setInterval(send, 5000);
    return () => {
      window.clearTimeout(debounce);
      window.clearInterval(heartbeat);
    };
  }, [cashierCode, liveHeartbeatPayload, liveSessionId]);

  useEffect(() => {
    if (!catalogOpen) return;
    const frame = window.requestAnimationFrame(() =>
      catalogSearchRef.current?.focus(),
    );
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
      if (
        target === document.activeElement &&
        target === document.querySelector(".cart-table")
      ) {
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
      if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey)
        return;
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
    return () =>
      window.removeEventListener("keydown", handleScannerCapture, true);
  }, []);

  function playTone(kind: "success" | "error") {
    if (!soundEnabled) return;
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
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

  function closeLiveSession(status: "held" | "cancelled") {
    if (isApiConfigured && liveSessionId) {
      void updateLiveTransaction(liveHeartbeatPayload(status)).catch(
        () => undefined,
      );
    }
    setLiveSessionId(crypto.randomUUID());
  }

  function focusScan() {
    window.requestAnimationFrame(() => searchRef.current?.focus());
  }

  function scrollSelectedIntoView(id: string) {
    window.requestAnimationFrame(() => {
      rowRefs.current
        .get(id)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  function selectByOffset(offset: number) {
    if (!cart.length) return;
    const currentIndex = Math.max(
      0,
      cart.findIndex((item) => item.id === selectedId),
    );
    const nextIndex = Math.min(
      cart.length - 1,
      Math.max(0, currentIndex + offset),
    );
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
    if (product.stock <= 0) {
      setScanError(`${product.name} sedang habis`);
      showToast(`${product.name} belum memiliki stok kasir.`);
      playTone("error");
      return;
    }
    const safeQuantity = Math.min(product.stock, 999, Math.max(1, quantity));
    const existingProduct = cart.find(
      (item) => item.barcode === product.barcode,
    );
    setCart((current) => {
      const existing = current.find((item) => item.barcode === product.barcode);
      if (existing) {
        return current.map((item) =>
          item.barcode === product.barcode
            ? {
                ...item,
                qty: Math.min(product.stock, 999, item.qty + safeQuantity),
              }
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
      setAnnouncement(
        `Pengali ${parsedMultiplier} aktif untuk scan berikutnya.`,
      );
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
      current.map((item) =>
        item.id === selectedId ? { ...item, qty: safeQuantity } : item,
      ),
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
      setAnnouncement(
        `${item.name} dihapus. Tekan Ctrl+Z untuk mengembalikan.`,
      );
      const next = current.filter((candidate) => candidate.id !== id);
      setSelectedId(next[Math.min(index, next.length - 1)]?.id ?? "");
      window.setTimeout(() => {
        setLastRemoved((removed) =>
          removed?.item.id === item.id ? null : removed,
        );
      }, 5000);
      return next;
    });
  }

  function undoRemove() {
    if (!lastRemoved) return;
    setCart((current) => {
      if (current.some((item) => item.id === lastRemoved.item.id))
        return current;
      const next = [...current];
      next.splice(
        Math.min(lastRemoved.index, next.length),
        0,
        lastRemoved.item,
      );
      return next;
    });
    setSelectedId(lastRemoved.item.id);
    setAnnouncement(`${lastRemoved.item.name} dikembalikan.`);
    setLastRemoved(null);
    setToast(null);
  }

  async function holdTransaction() {
    if (!cart.length) {
      showToast("Belum ada transaksi untuk disimpan.");
      return;
    }
    try {
      if (isApiConfigured) {
        await saveHold({
          store_code: "MY-001",
          cashier_code: cashierCode,
          member_phone: memberFound
            ? memberPhone.replace(/\D/g, "")
            : undefined,
          items: cart.map((item) => ({
            barcode: item.barcode,
            quantity: item.qty,
          })),
          notes: "Hold dari layar kasir",
        });
        await refreshCashierData();
      }
      closeLiveSession("held");
      setCart([]);
      setSelectedId("");
      setReceivedText("");
      setAnnouncement("Transaksi disimpan sementara.");
      showToast("Transaksi disimpan. Tekan F8 untuk memanggil kembali.");
      focusScan();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Hold transaksi gagal",
      );
    }
  }

  async function recallTransaction() {
    const heldSale = heldTransactions.at(-1);
    if (!heldSale) {
      showToast("Tidak ada transaksi tersimpan.");
      return;
    }
    const recalled = heldSale.items.flatMap((line) => {
      const product = products.find((item) => item.barcode === line.barcode);
      return product ? [{ ...product, qty: line.quantity }] : [];
    });
    if (!recalled.length) {
      showToast("Produk transaksi hold sudah tidak tersedia.");
      return;
    }
    setCart(recalled);
    setSelectedId(recalled.at(-1)?.id ?? "");
    if (isApiConfigured) {
      await deleteHold(heldSale.id).catch(() => undefined);
      await refreshCashierData();
    } else {
      setHeldTransactions((current) => current.slice(0, -1));
    }
    setAnnouncement("Transaksi tersimpan dipanggil kembali.");
    showToast("Transaksi berhasil dipanggil kembali.");
  }

  async function openShift() {
    try {
      setIsSaving(true);
      setShift(await openCashierShift(cashierCode, Number(openingCash || 0)));
      showToast("Shift kasir dibuka.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Shift gagal dibuka");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveCashMovement() {
    if (!shift) return;
    try {
      setIsSaving(true);
      const next = await addShiftCashMovement(shift.id, cashierCode, {
        ...cashMovement,
        amount: Number(cashMovement.amount || 0),
      });
      setShift(next);
      setCashMovement({ ...cashMovement, amount: "", note: "" });
      showToast("Kas laci berhasil dicatat.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Kas laci gagal dicatat",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function closeShift() {
    if (!shift) return;
    try {
      setIsSaving(true);
      const result = await closeCashierShift(
        shift.id,
        cashierCode,
        Number(closingCash || 0),
      );
      setShift(result);
      showToast(`Shift ditutup. Selisih ${money(result.difference || 0)}.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Shift gagal ditutup");
    } finally {
      setIsSaving(false);
    }
  }

  async function processVoid() {
    if (!voidTarget) return;
    try {
      setIsSaving(true);
      await voidSale(voidTarget, supervisorCode, supervisorPin, voidReason);
      await refreshCashierData();
      setDialog("history");
      setSupervisorCode("");
      setSupervisorPin("");
      setVoidReason("");
      showToast("Transaksi berhasil di-void dan stok dikembalikan.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Void transaksi gagal",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function reprintSale(sale: SaleDetail) {
    const popup = window.open("", "receipt", "width=420,height=640");
    if (!popup) return;
    const rows = sale.items
      .map(
        (item) =>
          `<tr><td>${item.product_name}<br><small>${item.quantity} × ${money(item.unit_price)}</small></td><td style="text-align:right">${money(item.subtotal)}</td></tr>`,
      )
      .join("");
    popup.document.write(
      `<html><head><title>${sale.transaction_no}</title><style>@page{size:${posConfig.receipt_paper}mm auto;margin:4mm}body{font-family:monospace;width:${posConfig.receipt_paper === "58" ? "210px" : "300px"};margin:auto;padding:12px}h2,p{text-align:center}table{width:100%;border-collapse:collapse}td{padding:6px 0;border-bottom:1px dashed #aaa}.total{font-size:18px;font-weight:bold;text-align:right;margin-top:16px}</style></head><body><h2>${posConfig.store_name}</h2><p>${posConfig.store_address || ""}<br>${sale.transaction_no}<br>${new Date(sale.created_at).toLocaleString("id-ID")}</p><table>${rows}</table><div class="total">Total ${money(sale.total)}</div><p>${posConfig.receipt_footer}</p><script>window.onload=()=>window.print()</script></body></html>`,
    );
    popup.document.close();
  }

  function printCurrentReceipt() {
    const popup = window.open("", "receipt", "width=420,height=640");
    if (!popup) return;
    const rows = cart
      .map(
        (item) =>
          `<tr><td>${item.name}<br><small>${item.qty} Ã— ${money(item.price)}</small></td><td style="text-align:right">${money(item.qty * item.price)}</td></tr>`,
      )
      .join("");
    const paidTotal = receiptSummary?.total ?? total;
    popup.document.write(
      `<html><head><title>${receiptTransactionNo || "Struk"}</title><style>@page{size:${posConfig.receipt_paper}mm auto;margin:4mm}body{font-family:monospace;width:${posConfig.receipt_paper === "58" ? "210px" : "300px"};margin:auto;padding:12px}h2,p{text-align:center}table{width:100%;border-collapse:collapse}td{padding:6px 0;border-bottom:1px dashed #aaa}.total{font-size:18px;font-weight:bold;text-align:right;margin-top:16px}</style></head><body><h2>${posConfig.store_name}</h2><p>${posConfig.store_address || ""}<br>${receiptTransactionNo}</p><table>${rows}</table><div class="total">Total ${money(paidTotal)}</div><p>${posConfig.receipt_footer}</p><script>window.onload=()=>window.print()</script></body></html>`,
    );
    popup.document.close();
  }

  function selectPaymentMethod(method: PaymentMethod) {
    if (method !== paymentMethod) {
      if (method === "qris") setQrisConfirmed(false);
      if (method === "edc") setCardConfirmed(false);
      if (method === "wallet") setWalletConfirmed(false);
      if (method === "debit" || method === "credit") setCardConfirmed(false);
      if (method === "voucher") setVoucherConfirmed(false);
      if (method === "qris" || method === "edc") setApprovalCode("");
    }
    setPaymentMethod(method);
    setPaymentMessage("");
    setVoucherError("");
  }

  function focusPaymentRequirement() {
    window.requestAnimationFrame(() => {
      if (paymentMethod === "cash") cashRef.current?.focus();
      else if (paymentMethod === "qris") {
        approvalRef.current?.focus();
      } else if (paymentMethod === "edc") {
        if (!/^\d{12,19}$/.test(edcCardNumber)) cardNumberRef.current?.focus();
        else approvalRef.current?.focus();
      } else if (paymentMethod === "wallet") {
        digitalConfirmRef.current?.focus();
      } else if (paymentMethod === "debit" || paymentMethod === "credit") {
        approvalRef.current?.focus();
      } else voucherRef.current?.focus();
    });
  }

  function openReceiptOrCashWarning() {
    if (
      paymentMethod === "cash" &&
      total > 0 &&
      effectiveReceived > total * 10
    ) {
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
    if (liveSessionId) {
      void updateLiveTransaction(liveHeartbeatPayload("processing")).catch(
        () => undefined,
      );
    }
    try {
      if (!checkoutKeyRef.current) checkoutKeyRef.current = crypto.randomUUID();
      const sale = await saveCheckout(
        {
          store_code: "MY-001",
          cashier_code: cashierCode,
          member_phone: memberFound
            ? memberPhone.replace(/\D/g, "")
            : undefined,
          items: cart.map((item) => ({
            barcode: item.barcode,
            quantity: item.qty,
          })),
          payment: {
            method: paymentMethod,
            received_amount:
              paymentMethod === "cash" ? effectiveReceived : undefined,
            approval_code:
              paymentMethod === "qris" ||
              paymentMethod === "edc" ||
              paymentMethod === "debit" ||
              paymentMethod === "credit"
                ? approvalCode.trim() || undefined
                : undefined,
            card_type: paymentMethod === "edc" ? edcCardType : undefined,
            card_number: paymentMethod === "edc" ? edcCardNumber : undefined,
            voucher_code:
              paymentMethod === "voucher" ? voucherCode.trim() : undefined,
            confirmed:
              paymentMethod === "qris"
                ? qrisConfirmed
                : paymentMethod === "edc"
                  ? cardConfirmed
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
      setReceiptSummary(sale);
      setDialog("receipt");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaksi gagal disimpan";
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
            ? "Isi nomor approval dan konfirmasi pembayaran"
            : paymentMethod === "edc"
              ? "Lengkapi jenis kartu, nomor kartu, dan nomor approval EDC"
            : paymentMethod === "debit" || paymentMethod === "credit"
              ? "Konfirmasi transaksi EDC"
              : "Masukkan kode voucher yang valid";
      setPaymentMessage(message);
      setAnnouncement(message);
      focusPaymentRequirement();
      return;
    }
    if (paymentMethod === "cash" && !receivedText)
      setReceivedText(String(total));
    setPaymentMessage("");
    openReceiptOrCashWarning();
  }

  function confirmDigitalPayment() {
    // TODO: ganti konfirmasi manual ini dengan callback gateway pembayaran backend.
    if (paymentMethod === "qris" && approvalCode.trim().length < 4) {
      setPaymentMessage("Nomor approval QRIS minimal 4 karakter");
      approvalRef.current?.focus();
      return;
    }
    if (paymentMethod === "qris") setQrisConfirmed(true);
    if (paymentMethod === "wallet") setWalletConfirmed(true);
    setPaymentMessage("");
    setAnnouncement(
      `${paymentMethod === "qris" ? "QRIS" : "E-Wallet"} diterima.`,
    );
    window.requestAnimationFrame(() => payRef.current?.focus());
  }

  function confirmCardPayment() {
    if (paymentMethod === "edc") {
      if (!/^\d{12,19}$/.test(edcCardNumber)) {
        setPaymentMessage("Nomor kartu EDC harus 12 sampai 19 digit");
        cardNumberRef.current?.focus();
        return;
      }
      if (approvalCode.trim().length < 4) {
        setPaymentMessage("Nomor approval EDC minimal 4 karakter");
        approvalRef.current?.focus();
        return;
      }
    }
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
      if (result.valid)
        window.requestAnimationFrame(() => payRef.current?.focus());
      else voucherRef.current?.focus();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Voucher gagal divalidasi";
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
    setEdcCardType("debit");
    setEdcCardNumber("");
    setCardConfirmed(false);
    setVoucherCode("");
    setVoucherConfirmed(false);
    setVoucherError("");
    setPaymentMessage("");
    setPendingMultiplier(1);
    setReceiptTransactionNo("");
    setReceiptSummary(null);
    checkoutKeyRef.current = "";
    if (isApiConfigured) setLiveSessionId(crypto.randomUUID());
    setDialog(null);
    setAnnouncement(message);
    showToast(message);
    focusScan();
  }

  function finishReceipt(printReceipt: boolean) {
    if (printReceipt) printCurrentReceipt();
    void refreshCashierData();
    resetTransaction(
      printReceipt
        ? "Struk dicetak. Transaksi baru siap."
        : "Transaksi baru siap.",
    );
  }

  function confirmCancel() {
    closeLiveSession("cancelled");
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
      const message = found
        ? "Member Budi Santoso ditemukan."
        : "Member tidak ditemukan.";
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
    if (
      /^\d$/.test(event.key) &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
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
      const nextMethod = availablePaymentMethods[nextIndex];
      if (!nextMethod) return;
      selectPaymentMethod(nextMethod.id);
      window.requestAnimationFrame(() =>
        paymentRefs.current[nextIndex]?.focus(),
      );
      return;
    }
    const horizontal =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const vertical =
      event.key === "ArrowDown" ? 3 : event.key === "ArrowUp" ? -3 : 0;
    const direction = horizontal || vertical;
    if (!direction) return;
    event.preventDefault();
    const nextIndex =
      (currentIndex + direction + availablePaymentMethods.length) %
      availablePaymentMethods.length;
    selectPaymentMethod(availablePaymentMethods[nextIndex].id);
    window.requestAnimationFrame(() => paymentRefs.current[nextIndex]?.focus());
  }

  function handleCashKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (
      (event.key === "ArrowUp" || event.key === "ArrowDown") &&
      presets.length
    ) {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const currentIndex =
        presetIndex >= 0 ? presetIndex : direction > 0 ? -1 : 0;
      const nextIndex =
        (currentIndex + direction + presets.length) % presets.length;
      setTender(presets[nextIndex]);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      finishTransaction();
    }
  }

  function handleScanKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (
      event.altKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
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

    const paymentIndex = paymentShortcutIds.findIndex((id) =>
      matchesShortcut(nativeEvent, id),
    );
    if (paymentIndex >= 0) {
      event.preventDefault();
      const method = paymentMethods[paymentIndex];
      const availableIndex = availablePaymentMethods.findIndex(
        (item) => item.id === method.id,
      );
      if (availableIndex < 0) {
        showToast(`${method.label} sedang dinonaktifkan.`);
        return;
      }
      selectPaymentMethod(method.id);
      window.requestAnimationFrame(() =>
        paymentRefs.current[availableIndex]?.focus(),
      );
      return;
    }

    const target = event.target as HTMLElement;
    const isTyping = target.matches(
      "input, textarea, [contenteditable='true']",
    );
    if (
      !isTyping &&
      event.ctrlKey &&
      event.key.toLocaleLowerCase("id-ID") === "z"
    ) {
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

  const selectedPayment = availablePaymentMethods.find(
    (method) => method.id === paymentMethod,
  )!;
  const formattedTime = now
    ? new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Makassar",
      }).format(now)
    : "--.--";
  const formattedDate = now
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Makassar",
      }).format(now)
    : "Memuat tanggal…";

  return (
    <div
      className="app-shell"
      onKeyDown={handleAppKeyDown}
      onFocusCapture={(event) => {
        const target = event.target as HTMLElement;
        if (target === searchRef.current) setFocusArea("scan");
        else if (target === cashRef.current) setFocusArea("cash");
        else if (target.closest(".cart-table")) setFocusArea("table");
        else if (target.closest(".payment-methods, .tender-section"))
          setFocusArea("payment");
        else setFocusArea(null);
      }}
    >
      <header className="topbar">
        <div className="brand-block">
          <Image
            src="/logo-app.png"
            width={86}
            height={60}
            alt="MYMARKET"
            className="brand-logo-image"
            priority
          />
          <div className="brand-copy">
            <div className="store-line">
              <Store size={13} />
              <span>{posConfig.store_name}</span>
            </div>
          </div>
        </div>

        <div
          className="operator-line pos-time"
          aria-label={`Pukul ${formattedTime} WITA`}
        >
          <span aria-hidden="true" />
          <time>{formattedTime} WITA</time>
        </div>

        <div className="header-actions pos-user-menu">
          <button
            className="pos-store-select"
            title="Kelola shift"
            onClick={() => setDialog("shift")}
          >
            <span className="store-avatar">
              <Store size={16} />
            </span>
            <b>Shift kasir</b>
            <ChevronDown size={14} />
          </button>
          <button
            className="pos-icon-button"
            onClick={() => setDialog("lock")}
            aria-keyshortcuts="F9"
            title={`${shortcutDisplay("lock")} — Kunci kasir`}
            aria-label="Kunci kasir"
          >
            <LockKeyhole size={18} />
          </button>
          <span className="pos-profile">
            <span className="profile-avatar">
              <User size={18} />
            </span>
            <span>
              <b>{cashierName}</b>
              <small>{cashierRole}</small>
            </span>
          </span>
          <details className="pos-more-menu">
            <summary className="pos-icon-button" aria-label="Menu lainnya">
              <Ellipsis size={19} />
            </summary>
            <div className="pos-more-menu-panel">
              {sessionUser?.permissions.includes("admin.overview") ? (
                <Link className="pos-menu-item" href="/admin">
                  <Grid3X3 size={16} />
                  <span>Dashboard</span>
                </Link>
              ) : null}
              <button
                className="pos-menu-item"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  showToast("Kalkulator kasir siap digunakan.");
                }}
              >
                <Calculator size={16} />
                <span>Kalkulator</span>
              </button>
              <button
                className="pos-menu-item"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  if (document.fullscreenElement) void document.exitFullscreen();
                  else void document.documentElement.requestFullscreen();
                }}
              >
                <Maximize size={16} />
                <span>Layar penuh</span>
              </button>
              <button
                className="pos-menu-item"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  setDialog("history");
                }}
              >
                <Printer size={16} />
                <span>Riwayat struk</span>
              </button>
              <button
                className="pos-menu-item"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  setSoundEnabled((current) => !current);
                }}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>Suara scan</span>
                <small>{soundEnabled ? "Aktif" : "Mati"}</small>
              </button>
              <button
                className="pos-menu-item"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  setDialog("shortcuts");
                }}
              >
                <HelpCircle size={16} />
                <span>Bantuan pintasan</span>
              </button>
              <button
                className="pos-menu-item pos-menu-danger"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  setDialog("logout");
                }}
              >
                <LogOut size={16} />
                <span>Keluar akun</span>
              </button>
            </div>
          </details>
        </div>
      </header>

      <main className="workspace">
        <section className="surface cart-panel" aria-label="Keranjang belanja">
          <div className="pos-catalog-heading">
            <div>
              <h1>Selamat datang, {cashierName}</h1>
              <p>{formattedDate}</p>
            </div>
          </div>
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
              {pendingMultiplier > 1 && (
                <span className="multiplier-chip">×{pendingMultiplier}</span>
              )}
              <div className="scan-actions">
                <button
                  className="scan-tool catalog-trigger"
                  onClick={() => setCatalogOpen(true)}
                  tabIndex={-1}
                  aria-label="Buka katalog"
                  aria-keyshortcuts="F2"
                  title={`${shortcutDisplay("catalog")} — Buka katalog`}
                >
                  <Search size={15} />
                  <kbd>{shortcutRegistry.catalog.label}</kbd>
                </button>
                <kbd>Enter</kbd>
              </div>
            </div>
            <div
              className={`scan-feedback ${scanError ? "error" : ""}`}
              id="scan-feedback"
            >
              {scanError ? (
                <>
                  <AlertCircle size={13} />
                  {scanError}
                </>
              ) : query && scanSuggestion ? (
                <>
                  <Check size={13} />
                  Enter: {scanSuggestion.name}
                </>
              ) : pendingMultiplier > 1 ? (
                <>Pengali ×{pendingMultiplier} aktif untuk scan berikutnya.</>
              ) : null}
            </div>
          </div>

          <div className="pos-products">
            <div className="pos-product-grid">
              {visibleProducts.map((product, index) => {
                const cartItem = cart.find((item) => item.id === product.id);
                return (
                  <button
                    key={product.id}
                    tabIndex={-1}
                    className={`product-info ${cartItem ? "active" : ""}`}
                    onClick={() => addProduct(product)}
                    aria-label={`Tambah ${product.name}`}
                    disabled={product.stock <= 0}
                  >
                    <span className={`product-image product-tone-${index % 7}`}>
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="180px"
                        />
                      ) : (
                        <PackageSearch size={38} />
                      )}
                      <em>{product.category}</em>
                      {cartItem ? <i>{cartItem.qty}</i> : null}
                    </span>
                    <span className="product-content">
                      <b>{product.name}</b>
                      <small>{product.barcode}</small>
                      <span>
                        <strong>{money(product.price)}</strong>
                        <em>
                          {product.stock > 0
                            ? `${product.stock} stok`
                            : "Habis"}
                        </em>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {!visibleProducts.length ? (
              <div className="no-products">
                <PackageSearch size={34} />
                <h2>Produk tidak ditemukan</h2>
                <p>Coba kata kunci lain.</p>
              </div>
            ) : null}
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
                  <th className="center-cell" role="columnheader">
                    No.
                  </th>
                  <th role="columnheader">Produk</th>
                  <th className="number-cell" role="columnheader">
                    Harga
                  </th>
                  <th className="center-cell" role="columnheader">
                    Qty
                  </th>
                  <th className="number-cell" role="columnheader">
                    Subtotal
                  </th>
                  <th className="center-cell" role="columnheader">
                    Aksi
                  </th>
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
                      <td className="center-cell row-number" role="gridcell">
                        {index + 1}
                      </td>
                      <td className="product-cell" role="gridcell">
                        <b>{item.name}</b>
                        {selected && <small>{item.barcode}</small>}
                      </td>
                      <td className="number-cell money-cell" role="gridcell">
                        {money(item.price)}
                      </td>
                      <td role="gridcell">
                        <div
                          className="stepper"
                          aria-label={`Jumlah ${item.name}`}
                        >
                          <button
                            tabIndex={-1}
                            aria-label={`Kurangi ${item.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              changeQuantity(item.id, -1);
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <b>{item.qty}</b>
                          <button
                            tabIndex={-1}
                            aria-label={`Tambah ${item.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              changeQuantity(item.id, 1);
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="number-cell subtotal-cell" role="gridcell">
                        {money(item.price * item.qty)}
                      </td>
                      <td className="center-cell" role="gridcell">
                        <button
                          className="icon-button delete-button"
                          tabIndex={-1}
                          aria-label={`Hapus ${item.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeItem(item.id);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
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
                onClick={() =>
                  showToast("Diskon siap dihubungkan ke aturan promo backend.")
                }
              />
              <FunctionButton
                id="hold-button"
                shortcutId="hold"
                label="Hold"
                icon={Pause}
                onClick={holdTransaction}
              />
              <FunctionButton
                id="recall-button"
                shortcutId="recall"
                label="Recall"
                badge={heldTransactions.length || undefined}
                icon={RotateCcw}
                onClick={recallTransaction}
              />
              <button
                className="function-button danger-transaction-action"
                onClick={() => setDialog("cancel")}
              >
                <Trash2 size={15} />
                <span>Batalkan</span>
              </button>
            </div>
          </div>
        </section>

        <section className="surface payment-panel" aria-label="Pembayaran">
          <div className="total-display">
            <div className="total-label-row">
              <span>
                <ReceiptText size={15} />
                Total belanja
              </span>
              <b>{totalQty} item</b>
            </div>
            <div className="total-number">
              <span>Rp</span>
              <strong>{integer.format(total)}</strong>
            </div>
            <dl className="summary-grid">
              <div>
                <dt>Subtotal</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              {discount !== 0 && (
                <div>
                  <dt>Diskon</dt>
                  <dd>{money(discount)}</dd>
                </div>
              )}
              {tax !== 0 && (
                <div>
                  <dt>PPN</dt>
                  <dd>{money(tax)}</dd>
                </div>
              )}
              {rounding !== 0 && (
                <div>
                  <dt>Pembulatan</dt>
                  <dd>{money(rounding)}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="payment-content">
            <section
              className={`payment-section member-section ${
                memberFound && member ? "has-member" : ""
              }`}
              aria-labelledby="member-title"
            >
              <div className="section-heading">
                <span id="member-title">
                  <User size={14} />
                  Pelanggan / member
                </span>
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
                <button
                  tabIndex={-1}
                  onClick={findMember}
                  aria-label="Cari member"
                  title="Cari member"
                >
                  <Search size={15} />
                </button>
              </div>
              {memberFound && member ? (
                <div className="member-card">
                  <div className="member-icon">
                    <Crown size={15} />
                  </div>
                  <div className="member-copy">
                    <div>
                      <b>{member.full_name}</b>
                      <span>{member.tier}</span>
                    </div>
                    <small>ID {member.id.slice(0, 8).toUpperCase()}</small>
                  </div>
                  <div className="points">
                    <small>Poin {integer.format(member.points)}</small>
                    <b>+{integer.format(estimatedPoints)} estimasi</b>
                  </div>
                </div>
              ) : null}
            </section>

            <section
              className="payment-section method-section"
              aria-labelledby="payment-method-title"
            >
              <div className="section-heading">
                <span id="payment-method-title">
                  <Wallet size={14} />
                  Metode pembayaran
                </span>
              </div>
              <div
                className="payment-methods"
                role="radiogroup"
                aria-label="Metode pembayaran"
              >
                {availablePaymentMethods.map((method, index) => {
                  const Icon = method.icon;
                  const active = method.id === paymentMethod;
                  return (
                    <button
                      key={method.id}
                      ref={(node) => {
                        paymentRefs.current[index] = node;
                      }}
                      className={`payment-method ${active ? "active" : ""}`}
                      data-method={method.id}
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
                      <kbd>
                        {shortcutRegistry[paymentShortcutIds[index]].keycap}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              className="payment-section tender-section"
              aria-live="polite"
            >
              {paymentMethod === "cash" ? (
                <>
                  <div className="section-heading">
                    <span>
                      <Banknote size={14} />
                      Uang diterima
                    </span>
                  </div>
                  <label
                    className={`cash-input ${cashShort || cashInputError ? "error" : ""}`}
                  >
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
                    <p className="field-error">
                      {cashInputError || `Kurang ${money(total - received)}`}
                    </p>
                  )}
                  <div className="cash-presets" aria-label="Nominal cepat">
                    {presets.map((value, index) => (
                      <button
                        key={`${value}-${index}`}
                        className={
                          presetIndex === index || received === value
                            ? "active"
                            : ""
                        }
                        onClick={() => setTender(value)}
                      >
                        <span>
                          {index === 0
                            ? "Pas"
                            : `${integer.format(value / 1000)}rb`}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className={`change-card ${cashShort ? "short" : ""}`}>
                    <div className="change-icon">
                      {!cashShort ? (
                        <Coins size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                    </div>
                    <span>
                      <small>{!cashShort ? "Kembalian" : "Masih kurang"}</small>
                      <strong>{money(Math.abs(change))}</strong>
                    </span>
                  </div>
                </>
              ) : paymentMethod === "qris" ? (
                <div className={`method-confirm-card qris-payment-detail ${qrisConfirmed ? "confirmed" : ""}`}>
                  <label className="method-confirm-field">
                    <span>
                      No. approval QRIS <small>Wajib</small>
                    </span>
                    <input
                      ref={approvalRef}
                      value={approvalCode}
                      onChange={(event) => {
                        setApprovalCode(event.target.value.toUpperCase().slice(0, 24));
                        setQrisConfirmed(false);
                        setPaymentMessage("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          confirmDigitalPayment();
                        }
                      }}
                      onFocus={() => setFocusArea("payment")}
                      tabIndex={5}
                      placeholder="Masukkan nomor approval"
                      aria-label="Nomor approval QRIS"
                      autoComplete="off"
                    />
                  </label>
                  <button
                    ref={digitalConfirmRef}
                    className="button confirm-payment-button"
                    onClick={confirmDigitalPayment}
                    onFocus={() => setFocusArea("payment")}
                    tabIndex={5}
                  >
                    <Check size={15} />
                    {qrisConfirmed ? "QRIS dikonfirmasi" : "Konfirmasi QRIS"}
                  </button>
                </div>
              ) : paymentMethod === "edc" ? (
                <div className={`method-confirm-card edc-payment-detail ${cardConfirmed ? "confirmed" : ""}`}>
                  <div className="edc-type-switch" role="radiogroup" aria-label="Jenis kartu EDC">
                    {(["debit", "credit"] as const).map((cardType) => (
                      <button
                        key={cardType}
                        type="button"
                        role="radio"
                        aria-checked={edcCardType === cardType}
                        className={edcCardType === cardType ? "active" : ""}
                        onClick={() => {
                          setEdcCardType(cardType);
                          setCardConfirmed(false);
                        }}
                      >
                        {cardType === "debit" ? "Debit" : "Kredit"}
                      </button>
                    ))}
                  </div>
                  <label className="method-confirm-field">
                    <span>
                      Nomor kartu <small>12–19 digit</small>
                    </span>
                    <input
                      ref={cardNumberRef}
                      type="password"
                      inputMode="numeric"
                      value={edcCardNumber}
                      onChange={(event) => {
                        setEdcCardNumber(event.target.value.replace(/\D/g, "").slice(0, 19));
                        setCardConfirmed(false);
                        setPaymentMessage("");
                      }}
                      onFocus={() => setFocusArea("payment")}
                      tabIndex={5}
                      placeholder="Nomor kartu EDC"
                      aria-label="Nomor kartu EDC"
                      autoComplete="off"
                    />
                  </label>
                  <label className="method-confirm-field">
                    <span>
                      No. approval EDC <small>Wajib</small>
                    </span>
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
                      placeholder="Nomor approval"
                      aria-label="Nomor approval EDC"
                      autoComplete="off"
                    />
                  </label>
                  <button
                    type="button"
                    className="button confirm-payment-button"
                    onClick={confirmCardPayment}
                  >
                    {cardConfirmed ? <Check size={14} /> : <Landmark size={14} />}
                    {cardConfirmed ? "EDC dikonfirmasi" : "Konfirmasi EDC"}
                  </button>
                </div>
              ) : paymentMethod === "wallet" ? (
                <div className="digital-payment-card">
                  <div className="digital-icon">
                    <selectedPayment.icon size={22} />
                  </div>
                  <div><b>Pembayaran digital</b></div>
                </div>
              ) : (
                <div className="method-confirm-card">
                  <label
                    className={`method-confirm-field ${voucherError ? "error" : ""}`}
                  >
                    <span>
                      Kode voucher <small>Wajib</small>
                    </span>
                    <input
                      ref={voucherRef}
                      value={voucherCode}
                      onChange={(event) => {
                        setVoucherCode(
                          event.target.value.toUpperCase().slice(0, 24),
                        );
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
                  <span
                    className={`method-status ${voucherConfirmed ? "confirmed" : ""}`}
                  >
                    {voucherConfirmed ? (
                      <Check size={14} />
                    ) : (
                      <Ticket size={14} />
                    )}
                    {voucherError ||
                      (voucherConfirmed
                        ? "Voucher valid"
                        : "Enter untuk validasi")}
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
              <span>
                <CircleCheck size={19} />
                <b>{isSaving ? "Menyimpan..." : "Bayar / selesaikan"}</b>
              </span>
              <span>
                <kbd>{shortcutRegistry.payment.label}</kbd>
                <ArrowRight size={17} />
              </span>
            </button>
            {checkoutReason && (
              <p id="checkout-reason" className="checkout-reason visible">
                {checkoutReason}
              </p>
            )}
          </div>
        </section>
      </main>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement} Total {money(total)}.
      </div>

      {catalogOpen && (
        <div
          className="modal-layer"
          role="presentation"
          onMouseDown={() => {
            setCatalogOpen(false);
            focusScan();
          }}
        >
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
                <span className="modal-icon">
                  <PackageSearch size={19} />
                </span>
                <span>
                  <small>Katalog produk</small>
                  <h2 id="catalog-title">Pilih produk</h2>
                </span>
              </div>
              <button
                className="icon-button"
                onClick={() => {
                  setCatalogOpen(false);
                  focusScan();
                }}
                aria-label="Tutup katalog"
              >
                <X size={18} />
              </button>
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
                const count =
                  cart.find((item) => item.id === product.id)?.qty ?? 0;
                return (
                  <button
                    className="catalog-item"
                    key={product.id}
                    onClick={() => addProduct(product)}
                  >
                    <span className="product-monogram">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt=""
                          width={42}
                          height={42}
                        />
                      ) : (
                        product.name.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <span className="catalog-item-copy">
                      <b>{product.name}</b>
                      <small>
                        {product.barcode} · {product.category}
                      </small>
                    </span>
                    <strong>{money(product.price)}</strong>
                    {count > 0 && (
                      <span className="in-cart">{count} di keranjang</span>
                    )}
                    <span className="round-add">
                      <Plus size={15} />
                    </span>
                  </button>
                );
              })}
              {!filteredProducts.length && (
                <div className="no-results">
                  <PackageSearch size={30} />
                  <b>Produk tidak ditemukan</b>
                  <span>Coba kata kunci lain.</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {dialog === "shift" && (
        <DialogShell
          label="Kelola shift kasir"
          onClose={() => {
            setDialog(null);
            focusScan();
          }}
        >
          <div className="neutral-orb">
            <Banknote size={27} />
          </div>
          <span className="eyebrow">Laci kas</span>
          <h2>
            {shift?.status === "open"
              ? "Shift sedang aktif"
              : "Buka shift baru"}
          </h2>
          {!shift || shift.status === "closed" ? (
            <div className="dialog-form">
              <label>Modal awal</label>
              <input
                inputMode="numeric"
                value={openingCash}
                onChange={(event) =>
                  setOpeningCash(event.target.value.replace(/\D/g, ""))
                }
                placeholder="500000"
              />
              <button
                className="button primary-button dialog-primary"
                disabled={isSaving}
                onClick={() => void openShift()}
              >
                Buka shift
              </button>
            </div>
          ) : (
            <>
              <div className="receipt-summary">
                <span>
                  <small>Modal</small>
                  <b>{money(shift.opening_cash)}</b>
                </span>
                <span>
                  <small>Penjualan tunai</small>
                  <b>{money(shift.cash_sales)}</b>
                </span>
                <span>
                  <small>Kas masuk</small>
                  <b>{money(shift.cash_in)}</b>
                </span>
                <span>
                  <small>Kas keluar</small>
                  <b>{money(shift.cash_out)}</b>
                </span>
                <span>
                  <small>Saldo seharusnya</small>
                  <b>{money(shift.expected_cash)}</b>
                </span>
              </div>
              <div className="dialog-form">
                <label>Kas masuk / keluar</label>
                <SearchableSelect
                  value={cashMovement.movement_type}
                  onChange={(event) =>
                    setCashMovement({
                      ...cashMovement,
                      movement_type: event.target.value as
                        "cash_in" | "cash_out",
                    })
                  }
                >
                  <option value="cash_out">Kas keluar</option>
                  <option value="cash_in">Kas masuk</option>
                </SearchableSelect>
                <input
                  value={cashMovement.category}
                  onChange={(event) =>
                    setCashMovement({
                      ...cashMovement,
                      category: event.target.value,
                    })
                  }
                  placeholder="Kategori"
                />
                <input
                  inputMode="numeric"
                  value={cashMovement.amount}
                  onChange={(event) =>
                    setCashMovement({
                      ...cashMovement,
                      amount: event.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="Nominal"
                />
                <input
                  value={cashMovement.note}
                  onChange={(event) =>
                    setCashMovement({
                      ...cashMovement,
                      note: event.target.value,
                    })
                  }
                  placeholder="Catatan"
                />
                <button
                  className="button quiet-button dialog-primary"
                  disabled={isSaving || !cashMovement.amount}
                  onClick={() => void saveCashMovement()}
                >
                  Catat kas laci
                </button>
                <label>Tutup shift</label>
                <input
                  inputMode="numeric"
                  value={closingCash}
                  onChange={(event) =>
                    setClosingCash(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder={`Uang fisik, seharusnya ${shift.expected_cash}`}
                />
                <button
                  className="button danger-button dialog-primary"
                  disabled={isSaving || !closingCash}
                  onClick={() => void closeShift()}
                >
                  Hitung selisih & tutup shift
                </button>
              </div>
            </>
          )}
          <button
            className="dialog-close"
            onClick={() => {
              setDialog(null);
              focusScan();
            }}
          >
            Kembali
          </button>
        </DialogShell>
      )}

      {dialog === "history" && (
        <DialogShell
          label="Riwayat transaksi kasir"
          onClose={() => {
            setDialog(null);
            focusScan();
          }}
        >
          <div className="neutral-orb">
            <ReceiptText size={27} />
          </div>
          <span className="eyebrow">Transaksi kasir</span>
          <h2>Riwayat & cetak ulang</h2>
          <div className="transaction-history">
            {cashierHistory.length ? (
              cashierHistory.map((sale) => (
                <div key={sale.id}>
                  <span>
                    <b>{sale.transaction_no}</b>
                    <small>
                      {new Date(sale.created_at).toLocaleString("id-ID")} ·{" "}
                      {sale.item_count} item
                    </small>
                  </span>
                  <strong>{money(sale.total)}</strong>
                  <div>
                    <button onClick={() => reprintSale(sale)}>
                      <Printer size={13} />
                      Cetak
                    </button>
                    {sale.status === "completed" ? (
                      <button
                        className="danger-text"
                        onClick={() => {
                          setVoidTarget(sale.transaction_no);
                          setDialog("void");
                        }}
                      >
                        <RotateCcw size={13} />
                        Void
                      </button>
                    ) : (
                      <small>{sale.status}</small>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>Belum ada transaksi tersimpan.</p>
            )}
          </div>
          <button
            className="button quiet-button dialog-primary"
            onClick={() => {
              void refreshCashierData();
            }}
          >
            Muat ulang
          </button>
          <button
            className="dialog-close"
            onClick={() => {
              setDialog(null);
              focusScan();
            }}
          >
            Tutup
          </button>
        </DialogShell>
      )}

      {dialog === "void" && (
        <DialogShell
          label="Void transaksi"
          onClose={() => setDialog("history")}
        >
          <div className="warning-orb">
            <Ban size={27} />
          </div>
          <span className="eyebrow">Persetujuan supervisor</span>
          <h2>Void transaksi?</h2>
          <p>{voidTarget}</p>
          <div className="dialog-form">
            <input
              value={supervisorCode}
              onChange={(event) =>
                setSupervisorCode(event.target.value.toUpperCase())
              }
              placeholder="Kode supervisor"
              autoComplete="username"
            />
            <input
              type="password"
              inputMode="numeric"
              value={supervisorPin}
              onChange={(event) => setSupervisorPin(event.target.value)}
              placeholder="PIN supervisor"
            />
            <textarea
              value={voidReason}
              onChange={(event) => setVoidReason(event.target.value)}
              placeholder="Alasan void"
              rows={3}
            />
            <button
              className="button danger-solid dialog-primary"
              disabled={
                isSaving ||
                supervisorCode.trim().length < 2 ||
                supervisorPin.length < 4 ||
                voidReason.length < 4
              }
              onClick={() => void processVoid()}
            >
              Setujui void
            </button>
          </div>
          <button className="dialog-close" onClick={() => setDialog("history")}>
            Batal
          </button>
        </DialogShell>
      )}

      {dialog === "shortcuts" && (
        <DialogShell
          label="Bantuan pintasan"
          onClose={() => {
            setDialog(null);
            focusScan();
          }}
        >
          <div className="neutral-orb">
            <HelpCircle size={27} />
          </div>
          <span className="eyebrow">Keyboard-first</span>
          <h2>Pintasan kasir</h2>
          <div className="shortcut-list">
            {helpShortcuts.map((id) => (
              <div key={id}>
                <kbd>{shortcutDisplay(id)}</kbd>
                <span>{shortcutRegistry[id].description}</span>
              </div>
            ))}
          </div>
          <button
            className="button primary-button dialog-primary"
            onClick={() => {
              setDialog(null);
              focusScan();
            }}
          >
            Tutup
          </button>
        </DialogShell>
      )}

      {dialog === "receipt" && (
        <DialogShell
          label="Transaksi berhasil"
          onClose={() => finishReceipt(false)}
        >
          <div className="success-orb">
            <CircleCheck size={29} />
          </div>
          <span className="eyebrow">Pembayaran berhasil</span>
          <h2>{money(receiptSummary?.total ?? total)}</h2>
          <p>Transaksi selesai dan siap dicetak.</p>
          <div className="receipt-summary">
            <span>
              <small>Metode</small>
              <b>{selectedPayment.label}</b>
            </span>
            {receiptTransactionNo && (
              <span>
                <small>No. transaksi</small>
                <b>{receiptTransactionNo}</b>
              </span>
            )}
            <span>
              <small>Kembalian</small>
              <b>
                {paymentMethod === "cash"
                  ? money(
                      receiptSummary?.payment?.change_amount ??
                        Math.max(0, change),
                    )
                  : "—"}
              </b>
            </span>
            {(receiptSummary?.discount || 0) > 0 ? (
              <span>
                <small>Diskon promo</small>
                <b>{money(receiptSummary?.discount || 0)}</b>
              </span>
            ) : null}
            {(receiptSummary?.tax || tax) > 0 ? (
              <span>
                <small>PPN</small>
                <b>{money(receiptSummary?.tax || tax)}</b>
              </span>
            ) : null}
          </div>
          <button
            className="button primary-button dialog-primary"
            onClick={() => finishReceipt(true)}
          >
            <Printer size={16} />
            Cetak struk <kbd>Enter</kbd>
          </button>
          <button className="dialog-close" onClick={() => finishReceipt(false)}>
            Lewati cetak <kbd>Esc</kbd>
          </button>
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
          <div className="warning-orb">
            <AlertCircle size={27} />
          </div>
          <span className="eyebrow">Periksa uang diterima</span>
          <h2>{money(effectiveReceived)}</h2>
          <p>
            Nominal lebih dari 10× total belanja. Pastikan tidak ada salah
            input.
          </p>
          <button
            className="button primary-button dialog-primary"
            onClick={() => void persistCheckoutAndOpenReceipt()}
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : "Lanjutkan pembayaran"}{" "}
            <kbd>Enter</kbd>
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
        <DialogShell
          label="Batalkan transaksi"
          onClose={() => {
            setDialog(null);
            focusScan();
          }}
        >
          <div className="warning-orb">
            <AlertCircle size={27} />
          </div>
          <span className="eyebrow">Konfirmasi</span>
          <h2>Batalkan transaksi?</h2>
          <p>Seluruh isi keranjang saat ini akan dikosongkan.</p>
          <button
            className="button danger-solid dialog-primary"
            onClick={confirmCancel}
          >
            Ya, batalkan <kbd>Enter</kbd>
          </button>
          <button
            className="dialog-close"
            onClick={() => {
              setDialog(null);
              focusScan();
            }}
          >
            Kembali <kbd>Esc</kbd>
          </button>
        </DialogShell>
      )}

      {dialog === "lock" && (
        <DialogShell
          label="Kasir terkunci"
          onClose={() => {
            setDialog(null);
            focusScan();
          }}
        >
          <div className="neutral-orb">
            <LockKeyhole size={27} />
          </div>
          <span className="eyebrow">Keamanan kasir</span>
          <h2>Layar dikunci</h2>
          <p>
            Simulasi penguncian aktif. Integrasikan autentikasi PIN melalui
            backend.
          </p>
          <button
            className="button primary-button dialog-primary"
            onClick={() => {
              setDialog(null);
              focusScan();
            }}
          >
            Buka kembali
          </button>
        </DialogShell>
      )}

      {dialog === "logout" && (
        <DialogShell
          label="Logout kasir"
          onClose={() => {
            setDialog(null);
            focusScan();
          }}
        >
          <div className="neutral-orb">
            <LogOut size={27} />
          </div>
          <span className="eyebrow">Akhiri sesi</span>
          <h2>Logout kasir?</h2>
          <p>
            Keranjang aktif sebaiknya diselesaikan atau di-hold sebelum keluar.
          </p>
          <Link
            className="button danger-solid dialog-primary"
            href="/login"
            onClick={() => {
              void logoutAccount().catch(() => undefined);
              window.localStorage.removeItem("mymarket_token");
              window.localStorage.removeItem("mymarket_user");
            }}
          >
            Keluar akun
          </Link>
          <button className="dialog-close" onClick={() => setDialog(null)}>
            Batal
          </button>
        </DialogShell>
      )}

      {toast && (
        <div className="toast" role="status">
          <CircleCheck size={16} />
          <span>{toast}</span>
          {lastRemoved && (
            <button onClick={undoRemove}>
              <Undo2 size={13} />
              Urungkan
            </button>
          )}
          <button
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
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
      <section
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onMouseDown={(event) => event.stopPropagation()}
      >
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
    <button
      id={id}
      className="function-button"
      onClick={onClick}
      title={shortcutDisplay(shortcutId)}
    >
      <Icon size={15} />
      <span>{label}</span>
      {badge ? <b className="function-badge">{badge}</b> : null}
      <kbd>{shortcutRegistry[shortcutId].label}</kbd>
    </button>
  );
}
