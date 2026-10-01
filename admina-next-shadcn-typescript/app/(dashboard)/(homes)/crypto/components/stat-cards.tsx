import AnalyticsStatSparkline from "@/components/charts/analytics-stat-sparkline";
import { ArrowUpDown, Bot, Percent, TrendingUp, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
  pillClass: string;
  data: number[];
  sparkColor?: string;
  footLabel: string;
  footValue: string;
  footClass: string;
}

const stats: Stat[] = [
  {
    id: "portfolio",
    label: "Total Portfolio",
    value: "89,425",
    icon: Wallet,
    iconClass: "bg-primary/10 border-primary/20 text-primary",
    pillClass: "border-green-200 dark:border-green-600/20 text-green-600 bg-green-50 dark:bg-green-600/10 dark:text-green-500",
    data: [18, 22, 19, 24, 21, 27, 25, 30, 28, 34],
    footLabel: "24h Change",
    footValue: "+$45,456.52",
    footClass: "text-red-600 dark:text-red-500",
  },
  {
    id: "bots",
    label: "Active Bots",
    value: "24 / 32",
    icon: Bot,
    iconClass: "bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500",
    pillClass: "border-primary/20 text-primary bg-primary/10",
    data: [15, 18, 16, 20, 19, 24, 22, 27, 25, 30],
    sparkColor: "#17a05b",
    footLabel: "Trades Today",
    footValue: "451",
    footClass: "text-primary",
  },
  {
    id: "defi",
    label: "DeFi Yield",
    value: "89,425",
    icon: TrendingUp,
    iconClass: "bg-amber-50 dark:bg-amber-600/10 border-amber-200 dark:border-amber-600/20 text-amber-700 dark:text-amber-500",
    pillClass: "border-amber-200 dark:border-amber-600/20 text-amber-700 bg-amber-50 dark:bg-amber-600/10",
    data: [34, 30, 32, 27, 29, 24, 26, 20, 23, 18],
    sparkColor: "#d97706",
    footLabel: "Win Rate",
    footValue: "72.4%",
    footClass: "text-green-600 dark:text-green-500",
  },
  {
    id: "session",
    label: "Avg. Session",
    value: "89,425",
    icon: Percent,
    iconClass: "bg-red-50 dark:bg-red-600/10 border-red-200 dark:border-red-600/20 text-red-600 dark:text-red-500",
    pillClass: "border-primary/20 text-primary bg-primary/10",
    data: [16, 14, 18, 15, 20, 17, 22, 19, 25, 28],
    sparkColor: "#ef4444",
    footLabel: "TVL Staked",
    footValue: "$75,324",
    footClass: "text-amber-800 dark:text-amber-500",
  },
];

const StatCards = () => {
  return (
    <>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className="col-span-12 md:col-span-6 2xl:col-span-3">
            <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
              <div className="flex items-start justify-between gap-2 mb-5">
                <div className={`w-14 h-14 border rounded-full flex items-center justify-center shrink-0 ${stat.iconClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-semibold text-sm ${stat.pillClass}`}>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  60.2%
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400 font-normal text-base mb-1">{stat.label}</p>
                  <h2 className="text-2xl font-bold mb-0 text-neutral-900 dark:text-white">{stat.value}</h2>
                </div>
                <AnalyticsStatSparkline data={stat.data} color={stat.sparkColor} />
              </div>
              <span className="block w-full h-0.5 bg-neutral-100 dark:bg-neutral-700 my-5" />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="font-normal text-base text-neutral-600 dark:text-neutral-300">{stat.footLabel}</span>
                <span className={`font-semibold text-base ${stat.footClass}`}>{stat.footValue}</span>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default StatCards;
