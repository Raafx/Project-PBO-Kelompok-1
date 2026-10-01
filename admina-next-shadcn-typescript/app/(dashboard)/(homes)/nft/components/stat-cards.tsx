import AnalyticsStatSparkline from "@/components/charts/analytics-stat-sparkline";
import type { LucideIcon } from "lucide-react";
import { ArrowDownUp, Brain, DollarSign, Hourglass, Palette } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconClass: string;
  changeClass: string;
  data: number[];
  /** Omit to use the reactive primary color (updates with the color scheme). */
  sparkColor?: string;
}

const stats: Stat[] = [
  {
    label: "Total Revenue",
    value: "$95,89,425",
    change: "60.2%",
    icon: DollarSign,
    iconClass: "bg-primary/10 text-primary",
    changeClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500",
    data: [20, 24, 22, 28, 25, 32, 30, 36, 34, 41],
  },
  {
    label: "Total Art Works",
    value: "340,230",
    change: "60.2%",
    icon: Palette,
    iconClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500",
    changeClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500",
    data: [15, 20, 18, 24, 22, 28, 26, 32, 30, 37],
    sparkColor: "#22c55e",
  },
  {
    label: "Total Auction",
    value: "89,425",
    change: "60.2%",
    icon: Hourglass,
    iconClass: "bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-500",
    changeClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500",
    data: [40, 30, 36, 26, 32, 24, 28, 20, 26, 16],
    sparkColor: "#facc15",
  },
  {
    label: "Total Creators",
    value: "89,425",
    change: "60.2%",
    icon: Brain,
    iconClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500",
    changeClass: "bg-primary/10 text-primary",
    data: [18, 26, 20, 30, 24, 34, 28, 36, 30, 42],
    sparkColor: "#f87171",
  },
];

const StatCards = () => {
  return (
    <div className="grid grid-cols-12 gap-5">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="col-span-12 sm:col-span-6">
            <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 rounded-2xl p-5 h-full">
              <div className="flex items-start justify-between gap-2 mb-4">
                <span className={`w-11 h-11 flex items-center justify-center rounded-full shrink-0 ${s.iconClass}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold text-xs ${s.changeClass}`}>
                  <ArrowDownUp className="w-3 h-3" />
                  {s.change}
                </span>
              </div>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium block mb-1">{s.label}</span>
              <div className="flex items-end justify-between gap-2">
                <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">{s.value}</h2>
                <div className="w-[90px] h-12 shrink-0 overflow-hidden flex items-center justify-end">
                  <AnalyticsStatSparkline data={s.data} color={s.sparkColor} width={90} height={48} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;
