export type ShortcutId =
  | "help"
  | "catalog"
  | "member"
  | "discount"
  | "hold"
  | "recall"
  | "payment"
  | "lock"
  | "paymentCash"
  | "paymentQris"
  | "paymentDebit"
  | "paymentCredit"
  | "paymentWallet"
  | "paymentVoucher";

export type ShortcutDefinition = {
  id: ShortcutId;
  label: string;
  keycap?: string;
  description: string;
  key: string;
  ctrl?: boolean;
  shift?: boolean;
};

export const shortcutRegistry: Record<ShortcutId, ShortcutDefinition> = {
  help: { id: "help", label: "F1", key: "F1", description: "Bantuan pintasan" },
  catalog: { id: "catalog", label: "F2", key: "F2", description: "Buka katalog" },
  member: { id: "member", label: "F4", key: "F4", description: "Cari member" },
  discount: { id: "discount", label: "F6", key: "F6", description: "Atur diskon" },
  hold: { id: "hold", label: "F7", key: "F7", description: "Simpan transaksi" },
  recall: { id: "recall", label: "F8", key: "F8", description: "Panggil transaksi" },
  lock: { id: "lock", label: "F9", key: "F9", description: "Kunci kasir" },
  payment: { id: "payment", label: "F12", key: "F12", description: "Validasi / selesaikan pembayaran" },
  paymentCash: {
    id: "paymentCash",
    label: "Ctrl+Shift+1",
    keycap: "1",
    key: "1",
    ctrl: true,
    shift: true,
    description: "Pilih tunai",
  },
  paymentQris: {
    id: "paymentQris",
    label: "Ctrl+Shift+2",
    keycap: "2",
    key: "2",
    ctrl: true,
    shift: true,
    description: "Pilih QRIS",
  },
  paymentDebit: {
    id: "paymentDebit",
    label: "Ctrl+Shift+3",
    keycap: "3",
    key: "3",
    ctrl: true,
    shift: true,
    description: "Pilih debit",
  },
  paymentCredit: {
    id: "paymentCredit",
    label: "Ctrl+Shift+4",
    keycap: "4",
    key: "4",
    ctrl: true,
    shift: true,
    description: "Pilih kredit",
  },
  paymentWallet: {
    id: "paymentWallet",
    label: "Ctrl+Shift+5",
    keycap: "5",
    key: "5",
    ctrl: true,
    shift: true,
    description: "Pilih e-wallet",
  },
  paymentVoucher: {
    id: "paymentVoucher",
    label: "Ctrl+Shift+6",
    keycap: "6",
    key: "6",
    ctrl: true,
    shift: true,
    description: "Pilih voucher",
  },
};

export const helpShortcuts: ShortcutId[] = [
  "help",
  "catalog",
  "member",
  "discount",
  "hold",
  "recall",
  "lock",
  "payment",
  "paymentCash",
  "paymentQris",
  "paymentDebit",
  "paymentCredit",
  "paymentWallet",
  "paymentVoucher",
];

export const paymentShortcutIds: ShortcutId[] = [
  "paymentCash",
  "paymentQris",
  "paymentDebit",
  "paymentCredit",
  "paymentWallet",
  "paymentVoucher",
];

export function matchesShortcut(event: KeyboardEvent, id: ShortcutId) {
  const shortcut = shortcutRegistry[id];
  return (
    event.key.toLocaleLowerCase("id-ID") === shortcut.key.toLocaleLowerCase("id-ID") &&
    Boolean(event.ctrlKey) === Boolean(shortcut.ctrl) &&
    Boolean(event.shiftKey) === Boolean(shortcut.shift) &&
    !event.altKey &&
    !event.metaKey
  );
}
