import CustomSelect from "@/components/shared/custom-select";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Banknote, CreditCard, QrCode, Repeat, Wallet } from "lucide-react";

interface Txn {
  name: string;
  detail: string;
  amount: string;
  date: string;
  icon: LucideIcon;
  iconClass: string;
}

const txns: Txn[] = [
  { name: "UPI Payment", detail: "Online Transaction", amount: "$84.50", date: "12 Jun, 2026", icon: QrCode, iconClass: "bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-500" },
  { name: "Digital Wallet", detail: "Card Payment", amount: "$456.75", date: "12 Jun, 2026", icon: Wallet, iconClass: "bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-500" },
  { name: "Mastro Card ****7893", detail: "Online Transaction", amount: "$2,450.00", date: "12 Jun, 2026", icon: CreditCard, iconClass: "bg-sky-100 dark:bg-sky-600/20 text-sky-600 dark:text-sky-500" },
  { name: "Cash On Delivery", detail: "Pay On Delivery", amount: "$415.00", date: "12 Jun, 2026", icon: Banknote, iconClass: "bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-500" },
  { name: "Cash On Delivery", detail: "Pay On Delivery", amount: "$812.99", date: "12 Jun, 2026", icon: Banknote, iconClass: "bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-500" },
  { name: "Visa Card ****2563", detail: "Card Payment", amount: "$712.99", date: "12 Jun, 2026", icon: CreditCard, iconClass: "bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-500" },
  { name: "Digital Wallet", detail: "Online Transaction", amount: "$312.99", date: "12 Jun, 2026", icon: Wallet, iconClass: "bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-500" },
  { name: "UPI Payment", detail: "Online Transaction", amount: "$112.99", date: "12 Jun, 2026", icon: QrCode, iconClass: "bg-cyan-100 dark:bg-cyan-600/20 text-cyan-600 dark:text-cyan-500" },
];

const RecentTransactionsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-amber-100 dark:bg-amber-600/20 flex items-center justify-center rounded-full text-amber-600 dark:text-amber-500 shrink-0">
            <Repeat className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Recent Transactions</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Latest transaction activity.</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="grow divide-y divide-neutral-100 dark:divide-neutral-700">
        {txns.map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} className="flex items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-700">
              <div className="flex items-center gap-3">
                <span className={`w-11 h-11 flex items-center justify-center rounded-full shrink-0 ${t.iconClass}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{t.name}</h2>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.detail}</span>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{t.amount}</h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.date}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4">
        <button type="button" className="text-primary hover:text-primary/80 font-semibold text-sm inline-flex items-center gap-2">
          See All Transactions <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RecentTransactionsCard;
