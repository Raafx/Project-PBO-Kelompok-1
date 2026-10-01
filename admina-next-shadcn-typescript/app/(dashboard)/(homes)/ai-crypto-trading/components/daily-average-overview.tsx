import CryptoAvgRing from "@/components/charts/crypto-avg-ring";
import { CornerDownLeft, DollarSign, PieChart, RefreshCw, ShoppingBag, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Card {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
  ringValue: number;
  ringColor: string;
  delta: string;
  deltaUp: boolean;
  deltaText: string;
  footLabel: string;
  footValue: string;
  footClass: string;
}

const cards: Card[] = [
  { label: "Daily Average Sales", value: "2,78,743", icon: ShoppingBag, iconClass: "bg-purple-50 dark:bg-purple-600/10 text-purple-600", ringValue: 53, ringColor: "#6366f1", delta: "44.7%", deltaUp: true, deltaText: "Increased this year", footLabel: "24h Change", footValue: "+$5,456.52", footClass: "text-red-600 dark:text-red-500" },
  { label: "Daily Average Returns", value: "$42,485", icon: CornerDownLeft, iconClass: "bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-500", ringValue: 82, ringColor: "#b8860b", delta: "88.5%", deltaUp: true, deltaText: "Increased this year", footLabel: "24h Change", footValue: "72.4%", footClass: "text-green-600 dark:text-green-500" },
  { label: "Daily Average Profit", value: "$50,142", icon: DollarSign, iconClass: "bg-sky-50 dark:bg-sky-600/10 text-sky-600 dark:text-sky-500", ringValue: 35, ringColor: "#14b8a6", delta: "-5.7%", deltaUp: false, deltaText: "Decreased this year", footLabel: "24h Change", footValue: "451", footClass: "text-primary" },
  { label: "Daily Average Orders", value: "5,54,545", icon: ShoppingCart, iconClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500", ringValue: 67, ringColor: "#22c55e", delta: "44.7%", deltaUp: true, deltaText: "Increased this year", footLabel: "24h Change", footValue: "$75,324", footClass: "text-amber-600 dark:text-amber-500" },
];

const DailyAverageOverview = () => {
  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-white dark:bg-[#273142] flex items-center justify-center rounded-full text-purple-600 shadow-md shrink-0">
            <PieChart className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-neutral-700 dark:text-white mb-1">Daily Average Overview</h2>
            <span className="font-normal text-sm text-neutral-500 dark:text-neutral-400">Here&apos;s a brief overview of your daily averages, highlighting your performance.</span>
          </div>
        </div>
        <button type="button" className="text-white py-3 px-6 inline-flex items-center gap-1 bg-primary hover:bg-primary/90 rounded-full shrink-0">
          <RefreshCw className="w-5 h-5" /><span className="font-medium text-sm text-white">Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          const DeltaIcon = c.deltaUp ? TrendingUp : TrendingDown;
          return (
            <div key={c.label} className="col-span-12 md:col-span-6">
              <div className="bg-white dark:bg-[#273142] rounded-[20px] h-full overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${c.iconClass}`}>
                        <Icon className="w-6 h-6" />
                      </span>
                      <div>
                        <p className="text-neutral-500 dark:text-neutral-400 font-normal text-base mb-1">{c.label}</p>
                        <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">{c.value}</h2>
                      </div>
                    </div>
                    <div className="w-[84px] shrink-0">
                      <CryptoAvgRing value={c.ringValue} color={c.ringColor} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm mt-3">
                    <span className={`font-semibold flex items-center gap-1 ${c.deltaUp ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                      <DeltaIcon className="w-3.5 h-3.5" />{c.delta}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">{c.deltaText}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-6 py-6 border-t border-neutral-200 dark:border-neutral-600">
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{c.footLabel}</span>
                  <span className={`text-sm font-bold ${c.footClass}`}>{c.footValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DailyAverageOverview;
