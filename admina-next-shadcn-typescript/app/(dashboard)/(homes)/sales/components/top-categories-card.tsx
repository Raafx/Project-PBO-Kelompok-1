import SalesCategoryGauge from "@/components/charts/sales-category-gauge";
import { BookOpen, LayoutGrid, Lightbulb, Puzzle, RefreshCw, Shirt, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Category {
  name: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
  change: string;
  up: boolean;
  gaugeValue: number;
  gaugeColor: string;
  footLabel: string;
  footValue: string;
  footClass: string;
}

const categories: Category[] = [
  { name: "Electronics", value: "8,14,233", icon: Lightbulb, iconClass: "bg-purple-50 dark:bg-purple-600/10 border-purple-100 dark:border-purple-600/20 text-purple-600", change: "5.36%", up: true, gaugeValue: 53, gaugeColor: "#487fff", footLabel: "24h Change", footValue: "+$5,456.52", footClass: "text-red-600 dark:text-red-500" },
  { name: "Fashion", value: "12,865", icon: Shirt, iconClass: "bg-amber-50 dark:bg-amber-600/10 border-amber-100 dark:border-amber-600/20 text-amber-600 dark:text-amber-500", change: "88.5%", up: true, gaugeValue: 82, gaugeColor: "#eab308", footLabel: "24h Change", footValue: "72.4%", footClass: "text-green-600 dark:text-green-500" },
  { name: "Toys", value: "34,753", icon: Puzzle, iconClass: "bg-cyan-50 dark:bg-cyan-600/10 border-cyan-100 dark:border-cyan-600/20 text-cyan-600 dark:text-cyan-500", change: "-5.7%", up: false, gaugeValue: 35, gaugeColor: "#14b8a6", footLabel: "24h Change", footValue: "451", footClass: "text-sky-600 dark:text-sky-500" },
  { name: "Books", value: "1,58,156", icon: BookOpen, iconClass: "bg-green-50 dark:bg-green-600/10 border-green-100 dark:border-green-600/20 text-green-600 dark:text-green-500", change: "44.7%", up: true, gaugeValue: 67, gaugeColor: "#22c55e", footLabel: "24h Change", footValue: "$75,324", footClass: "text-amber-600 dark:text-amber-500" },
];

const TopCategoriesCard = () => {
  return (
    <div className="border border-neutral-200 dark:border-neutral-600 p-4 rounded-2xl">
      <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 flex items-center justify-center rounded-full text-white shrink-0" style={{ backgroundColor: "#008198" }}>
            <LayoutGrid className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Top Categories By Sales</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Here are the top best-selling categories this month.</span>
          </div>
        </div>
        <button type="button" className="text-white py-2.5 px-5 inline-flex items-center gap-1 bg-primary hover:bg-primary/90 rounded-full shrink-0">
          <RefreshCw className="w-4 h-4" /><span className="font-medium text-sm">Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {categories.map((c) => {
          const Icon = c.icon;
          const TrendIcon = c.up ? TrendingUp : TrendingDown;
          return (
            <div key={c.name} className="col-span-12 md:col-span-6">
              <div className="border border-neutral-200 dark:border-neutral-600 rounded-xl p-5 h-full bg-white dark:bg-[#273142]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className={`w-11 h-11 border flex items-center justify-center rounded-full shrink-0 ${c.iconClass}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium block mb-1">{c.name}</span>
                      <h2 className="font-bold mb-1 text-2xl text-neutral-900 dark:text-white">{c.value}</h2>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <TrendIcon className={`w-3.5 h-3.5 ${c.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`} />
                        <span className={`font-semibold ${c.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{c.change}</span>
                        <span className="text-neutral-500 dark:text-neutral-400">Increased By</span>
                      </span>
                    </div>
                  </div>
                  <div className="w-24 h-24 shrink-0">
                    <SalesCategoryGauge value={c.gaugeValue} color={c.gaugeColor} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-600">
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{c.footLabel}</span>
                  <span className={`text-sm font-bold ${c.footClass}`}>{c.footValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopCategoriesCard;
