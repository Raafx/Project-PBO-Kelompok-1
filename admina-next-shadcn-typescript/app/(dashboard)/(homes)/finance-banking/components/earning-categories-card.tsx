import CustomSelect from "@/components/shared/custom-select";
import { ArrowRight, BadgeCheck, Box, Briefcase, Building2, CircleDollarSign, HandCoins, Monitor, TrendingUp, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Category {
  label: string;
  percent: string;
  color: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  { label: "Digital Assets", percent: "72.1%", color: "#3b82f6", icon: Briefcase },
  { label: "Interest", percent: "88.5%", color: "#22c55e", icon: TrendingUp },
  { label: "Side Project", percent: "67.2%", color: "#06b6d4", icon: Monitor },
  { label: "Rental", percent: "49.4%", color: "#f87171", icon: Building2 },
  { label: "Investment", percent: "49.4%", color: "#f87171", icon: HandCoins },
  { label: "Business", percent: "67.2%", color: "#06b6d4", icon: Box },
  { label: "Active", percent: "88.5%", color: "#22c55e", icon: CircleDollarSign },
  { label: "Affiliate", percent: "72.1%", color: "#3b82f6", icon: BadgeCheck },
  { label: "Freelance", percent: "57.8%", color: "#eab308", icon: Briefcase },
  { label: "Salary", percent: "69.9%", color: "#06b6d4", icon: Wallet },
];

const EarningCategoriesCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <HandCoins className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Earning Categories</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Earning Categories for Financial Growth</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={`${c.label}-${i}`}
              className="relative rounded-[10px] overflow-hidden h-12"
              style={{ backgroundColor: `${c.color}0d` }}
            >
              <div className="absolute top-0 left-0 h-full z-[1]" style={{ width: c.percent, background: `${c.color}26` }} />
              <div className="relative z-[2] flex items-center justify-between h-full px-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-white dark:bg-[#273142] rounded-lg flex items-center justify-center shrink-0" style={{ color: c.color }}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-neutral-900 dark:text-white font-medium text-xs">{c.label}</span>
                </div>
                <span className="text-neutral-900 dark:text-white font-semibold text-xs">{c.percent}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EarningCategoriesCard;
