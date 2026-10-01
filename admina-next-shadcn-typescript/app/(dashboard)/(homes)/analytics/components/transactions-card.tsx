import CustomSelect from "@/components/shared/custom-select";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Clapperboard, Coffee, CreditCard, HandCoins, Lightbulb, ShoppingBag, Smartphone, TrendingUp, User } from "lucide-react";

interface Txn {
  title: string;
  category: string;
  amount: string;
  note: string;
  icon: LucideIcon;
  iconClass: string;
}

const txns: Txn[] = [
  { title: "Bill Payment", category: "Utility", amount: "$84.50", note: "Electricity Bill", icon: Lightbulb, iconClass: "text-primary bg-primary/10 border-primary/20" },
  { title: "Card Payment", category: "Visa Card", amount: "$129.99", note: "Amazon Purchase", icon: ShoppingBag, iconClass: "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-600/10 border-green-100 dark:border-green-600/20" },
  { title: "Bank Transfer", category: "Bank", amount: "$2,450.00", note: "Salary Deposit", icon: CreditCard, iconClass: "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-600/10 border-green-100 dark:border-green-600/20" },
  { title: "Mobile Recharge", category: "Mobile Wallet", amount: "$15.00", note: "Prepaid Top-up", icon: Smartphone, iconClass: "text-primary bg-primary/10 border-primary/20" },
  { title: "Online Payment", category: "Subscription", amount: "$12.99", note: "Netflix Subscription", icon: Clapperboard, iconClass: "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-600/10 border-red-100 dark:border-red-600/20" },
  { title: "Money Transfer", category: "Bank Transfer", amount: "$220.00", note: "Sent to John Carter", icon: User, iconClass: "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-600/10 border-green-100 dark:border-green-600/20" },
  { title: "QR Payment", category: "QR Scan", amount: "$6.75", note: "Coffee Shop", icon: Coffee, iconClass: "text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-600/10 border-amber-100 dark:border-amber-600/20" },
  { title: "Investment Deposit", category: "Banking", amount: "$300.00", note: "Mutual Fund Top-up", icon: HandCoins, iconClass: "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-600/10 border-red-100 dark:border-red-600/20" },
];

const TransactionsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Transactions</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Latest transaction activity overview.</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Yearly", "Monthly", "Today"]} />
      </div>

      <div className="flex flex-col">
        {txns.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.title} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-transparent hover:bg-neutral-100 dark:hover:bg-slate-700 hover:border-neutral-200 dark:hover:border-neutral-600 transition">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full shrink-0 border flex justify-center items-center ${t.iconClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="grow">
                  <h2 className="text-sm mb-0 font-semibold text-neutral-900 dark:text-white">{t.title}</h2>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">{t.category}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-neutral-900 dark:text-white font-medium text-sm block mb-0.5">{t.amount}</span>
                <span className="font-normal text-xs text-neutral-500 dark:text-neutral-400">{t.note}</span>
              </div>
            </div>
          );
        })}

        <button type="button" className="flex items-center gap-2 text-primary hover:text-primary/80 text-base mt-3">
          See All Transactions <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TransactionsCard;
