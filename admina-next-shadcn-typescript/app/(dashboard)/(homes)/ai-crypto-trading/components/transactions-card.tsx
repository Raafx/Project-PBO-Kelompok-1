import CustomSelect from "@/components/shared/custom-select";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

interface Txn {
  name: string;
  date: string;
  amount: string;
  change: string;
  buy: boolean;
}

const txns: Txn[] = [
  { name: "Buy Bitcoin", date: "15 Jun, 2026", amount: "$84.50", change: "+1,25.95", buy: true },
  { name: "Sell Golem", date: "15 Jun, 2026", amount: "$6.75", change: "-1,74.21", buy: false },
  { name: "Buy Ethereum", date: "15 Jun, 2026", amount: "$2,450.00", change: "+1,25.95", buy: true },
  { name: "Sell Augur", date: "15 Jun, 2026", amount: "$15.00", change: "-1,74.21", buy: false },
  { name: "Buy Chainlink", date: "15 Jun, 2026", amount: "$12.99", change: "+1,25.95", buy: true },
];

const TransactionsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-full flex items-center justify-center shrink-0">
            <ArrowRight className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Transactions</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Latest transaction activity.</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month"]} />
      </div>

      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-700">
        {txns.map((t, i) => {
          const Icon = t.buy ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={i} className="flex items-center justify-between gap-2 py-3 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-700">
              <div className="flex items-center gap-2.5">
                <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.buy ? "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500" : "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500"}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{t.name}</h2>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{t.date}</span>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{t.amount}</h2>
                <span className={`text-xs font-semibold ${t.buy ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{t.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium w-fit">
          See All Transactions <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TransactionsCard;
