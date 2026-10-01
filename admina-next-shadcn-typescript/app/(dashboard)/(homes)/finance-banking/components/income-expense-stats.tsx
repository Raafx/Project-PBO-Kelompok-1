import FinanceWaveChart from "@/components/charts/finance-wave-chart";
import { ArrowDown, ArrowUp, Coins, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  icon: LucideIcon;
  iconBg: string;
  badge: string;
  badgeClass: string;
  data: number[];
  color?: string;
}

const stats: Stat[] = [
  {
    id: "income",
    label: "Total Income",
    value: "$84,250",
    icon: ArrowDown,
    iconBg: "bg-primary",
    badge: "+ 85.45%",
    badgeClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500",
    data: [20, 28, 22, 35, 26, 40, 30, 45, 32, 48],
  },
  {
    id: "expenses",
    label: "Total Expenses",
    value: "$32,100",
    icon: ArrowUp,
    iconBg: "",
    badge: "− 2.4%",
    badgeClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500",
    data: [30, 24, 34, 26, 40, 28, 36, 24, 38, 30],
    color: "#f87171",
  },
  {
    id: "average",
    label: "Average Income",
    value: "$7,020",
    suffix: "/mo",
    icon: Coins,
    iconBg: "",
    badge: "+ 55.12%",
    badgeClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500",
    data: [18, 30, 22, 38, 26, 44, 30, 40, 28, 46],
    color: "#22c55e",
  },
  {
    id: "daily",
    label: "Daily Sales Avg",
    value: "$1,450",
    icon: Zap,
    iconBg: "",
    badge: "+ 35.07%",
    badgeClass: "bg-sky-50 dark:bg-sky-600/10 text-sky-600 dark:text-sky-500",
    data: [22, 32, 24, 40, 28, 46, 30, 42, 26, 48],
    color: "#06b6d4",
  },
];

const iconStyle: Record<string, string> = {
  expenses: "#f87171",
  average: "#22c55e",
  daily: "#06b6d4",
};

const IncomeExpenseStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-full">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.id} className="bg-white dark:bg-[#273142] rounded-[20px] h-full overflow-hidden flex flex-col">
            <div className="p-6 pb-0">
              <div className="flex items-start justify-between gap-2 mb-4">
                <span
                  className={`w-11 h-11 text-white rounded-full flex items-center justify-center shrink-0 ${s.iconBg}`}
                  style={s.iconBg ? undefined : { background: iconStyle[s.id] }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className={`inline-flex rounded-full px-3 py-1.5 font-semibold text-xs ${s.badgeClass}`}>{s.badge}</span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 font-normal text-base mb-1">{s.label}</p>
              <h2 className="text-xl font-bold mb-0 text-neutral-900 dark:text-white">
                {s.value}
                {s.suffix && <span className="text-neutral-500 dark:text-neutral-400 text-base font-normal">{s.suffix}</span>}
              </h2>
            </div>
            <div className="w-full mt-auto">
              <FinanceWaveChart data={s.data} color={s.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IncomeExpenseStats;
