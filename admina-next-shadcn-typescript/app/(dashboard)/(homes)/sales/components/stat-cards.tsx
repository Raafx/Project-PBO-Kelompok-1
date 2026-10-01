import { CreditCard, DollarSign, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  change: string;
  changeClass: string;
  up: boolean;
}

const stats: Stat[] = [
  { id: "sales", label: "Number Of Sales", value: "32,745", icon: Wallet, iconBg: "#6366f1", change: "88.5%", changeClass: "text-primary", up: true },
  { id: "profit", label: "Profit By Sale", value: "$9,425", icon: DollarSign, iconBg: "#22c55e", change: "88.5%", changeClass: "text-green-600 dark:text-green-500", up: true },
  { id: "revenue", label: "Total Revenue", value: "$23,145", icon: CreditCard, iconBg: "#eab308", change: "3.4%", changeClass: "text-amber-600 dark:text-amber-500", up: false },
  { id: "customers", label: "Total Customers", value: "3,532", icon: Users, iconBg: "#f87171", change: "4.5%", changeClass: "text-red-600 dark:text-red-500", up: false },
];

const StatCards = () => {
  return (
    <>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.up ? TrendingUp : TrendingDown;
        return (
          <div key={stat.id} className="col-span-12 md:col-span-6 2xl:col-span-3">
            <div className="bg-white dark:bg-[#273142] p-5 rounded-2xl h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: stat.iconBg }}>
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block">{stat.label}</span>
                  <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">{stat.value}</h2>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className={`font-semibold flex items-center gap-1 ${stat.changeClass}`}>
                  <TrendIcon className="w-3.5 h-3.5" />{stat.change}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">This Month</span>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default StatCards;
