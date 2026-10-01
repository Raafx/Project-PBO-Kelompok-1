import AnalyticsStatSparkline from "@/components/charts/analytics-stat-sparkline";
import { ArrowRight, Briefcase, CircleDollarSign, TrendingDown, TrendingUp, UserCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
  data: number[];
  sparkColor?: string;
  badge: string;
  badgeClass: string;
  trendText: string;
  trendClass: string;
  trendUp: boolean;
}

const stats: Stat[] = [
  {
    id: "leads",
    label: "Leads Generated",
    value: "48.20k",
    icon: Users,
    iconClass: "bg-primary/10 border-primary/20 text-primary",
    data: [18, 22, 19, 24, 21, 27, 25, 30, 28, 34],
    badge: "5.12%",
    badgeClass: "bg-green-50 dark:bg-green-600/10 text-green-600 border-green-200 dark:border-green-600/20 dark:text-green-500",
    trendText: "2.3k Up",
    trendClass: "text-green-600 dark:text-green-500",
    trendUp: true,
  },
  {
    id: "qualified",
    label: "Qualified Leads",
    value: "12.80k",
    icon: UserCheck,
    iconClass: "bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500",
    data: [15, 18, 16, 20, 19, 24, 22, 27, 25, 30],
    sparkColor: "#17a05b",
    badge: "5.12%",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    trendText: "2.3k Up",
    trendClass: "text-primary",
    trendUp: true,
  },
  {
    id: "deals",
    label: "Deals Closed",
    value: "9.75k",
    icon: Briefcase,
    iconClass: "bg-amber-50 dark:bg-amber-600/10 border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500",
    data: [18, 24, 20, 26, 22, 28, 25, 31, 28, 34],
    sparkColor: "#d97706",
    badge: "5.12%",
    badgeClass: "bg-red-50 dark:bg-red-600/10 text-red-600 border-red-200 dark:border-red-600/20 dark:text-red-500",
    trendText: "2.3k down",
    trendClass: "text-red-600 dark:text-red-500",
    trendUp: false,
  },
  {
    id: "revenue",
    label: "Revenue Generated",
    value: "$5.63M",
    icon: CircleDollarSign,
    iconClass: "bg-red-50 dark:bg-red-600/10 border-red-200 dark:border-red-600/20 text-red-600 dark:text-red-500",
    data: [26, 32, 28, 34, 27, 25, 28, 22, 24, 18],
    sparkColor: "#ef4444",
    badge: "5.12%",
    badgeClass: "bg-amber-50 dark:bg-amber-600/10 text-amber-600 border-amber-200 dark:border-amber-600/20 dark:text-amber-500",
    trendText: "2.3k Up",
    trendClass: "text-amber-600 dark:text-amber-500",
    trendUp: false,
  },
];

const StatCards = () => {
  return (
    <>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
        return (
          <div key={stat.id} className="col-span-12 md:col-span-6 2xl:col-span-3">
            <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className={`w-12 h-12 border rounded-full flex items-center justify-center shrink-0 ${stat.iconClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <AnalyticsStatSparkline data={stat.data} color={stat.sparkColor} />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium text-base mb-1">{stat.label}</p>
              <div className="flex items-end gap-2 mb-4 justify-between">
                <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">{stat.value}</h2>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm mb-1">by this month</span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button type="button" className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 font-semibold text-sm border ${stat.badgeClass}`}>{stat.badge}</span>
                  <span className="text-neutral-600 dark:text-neutral-300 text-sm font-medium flex items-center gap-1">
                    <TrendIcon className={`w-4 h-4 ${stat.trendClass}`} />
                    {stat.trendText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default StatCards;
