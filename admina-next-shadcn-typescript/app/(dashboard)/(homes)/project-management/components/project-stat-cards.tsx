import { FileText, Landmark, Smartphone, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
  change: string;
  changeClass: string;
  trendUp: boolean;
}

const stats: Stat[] = [
  { id: "total", label: "Total Projects", value: "845", icon: FileText, iconClass: "bg-primary/10 text-primary", change: "92.4% Avg", changeClass: "text-primary", trendUp: true },
  { id: "active", label: "Active Projects", value: "125", icon: Smartphone, iconClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500", change: "60.2% Avg", changeClass: "text-amber-600 dark:text-amber-500", trendUp: true },
  { id: "completed", label: "Completed Projects", value: "240", icon: Landmark, iconClass: "bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-500", change: "09.4% Avg", changeClass: "text-red-600 dark:text-red-500", trendUp: false },
  { id: "members", label: "Total Members", value: "72", icon: Users, iconClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500", change: "44.7% Avg", changeClass: "text-green-600 dark:text-green-500", trendUp: false },
];

const ProjectStatCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
        return (
          <div key={stat.id} className="bg-white dark:bg-[#273142] px-6 py-10 rounded-[20px] h-full">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-neutral-500 dark:text-neutral-400 font-medium text-base mb-0">{stat.label}</h2>
              <CardDropdown />
            </div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-2xl font-bold mb-0 text-neutral-900 dark:text-white">{stat.value}</h2>
              <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${stat.iconClass}`}>
                <Icon className="w-6 h-6" />
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className={`font-semibold flex items-center gap-1 ${stat.changeClass}`}>
                <TrendIcon className="w-4 h-4" />{stat.change}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 font-normal">Since last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectStatCards;
