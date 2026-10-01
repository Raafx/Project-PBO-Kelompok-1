import CustomSelect from "@/components/shared/custom-select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ArrowUpDown, CreditCard, Landmark, Lightbulb, QrCode, Smartphone, TrendingUp } from "lucide-react";

interface Txn {
  title: string;
  category: string;
  amount: string;
  note: string;
  icon: LucideIcon;
  iconClass: string;
}

const txns: Txn[] = [
  { title: "Bill Payment", category: "Utility", amount: "$84.50", note: "Electricity Bill", icon: Lightbulb, iconClass: "bg-purple-50 dark:bg-purple-600/10 text-purple-600" },
  { title: "QR Payment", category: "QR Scan", amount: "$6.75", note: "Coffee Shop", icon: QrCode, iconClass: "bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-500" },
  { title: "Bank Transfer", category: "Bank", amount: "$2,450.00", note: "Salary Deposit", icon: Landmark, iconClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500" },
  { title: "Mobile Recharge", category: "Mobile Wallet", amount: "$15.00", note: "Prepaid Top-up", icon: Smartphone, iconClass: "bg-primary/10 text-primary" },
  { title: "Online Payment", category: "Subscription", amount: "$12.99", note: "Netflix Subscription", icon: CreditCard, iconClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500" },
];

const TransactionsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Transactions</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Latest transaction activity overview.</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-left whitespace-nowrap">
                <span className="inline-flex items-center gap-1">User | Designation<ArrowUpDown className="w-3.5 h-3.5" /></span>
              </TableHead>
              <TableHead className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-right whitespace-nowrap">
                <span className="inline-flex items-center gap-1">Action<ArrowUpDown className="w-3.5 h-3.5" /></span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {txns.map((t) => {
              const Icon = t.icon;
              return (
                <TableRow key={t.title} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                  <TableCell className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.iconClass}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{t.title}</h2>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.category}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-5 text-right">
                    <span className="block text-sm font-bold text-neutral-900 dark:text-white leading-none mb-1">{t.amount}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.note}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-5">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All Transactions <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TransactionsCard;
