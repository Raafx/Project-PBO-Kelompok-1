import CryptoDefiYieldChart from "@/components/charts/crypto-defi-yield-chart";
import CustomSelect from "@/components/shared/custom-select";
import { ArrowDown, ArrowUp, Droplets, Flower, Layers, Leaf } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClass: string;
  barWidth: string;
  barColor: string;
  deltaValue: string;
  deltaLabel: string;
  deltaClass: string;
  deltaUp: boolean;
}

const cards: StatCard[] = [
  {
    label: "Total Staked",
    value: "$64,124.78",
    icon: Layers,
    iconClass: "bg-primary/10 border-primary/20 text-primary",
    barWidth: "72%",
    barColor: "bg-primary",
    deltaValue: "72%",
    deltaLabel: "of portfolio staked",
    deltaClass: "text-primary",
    deltaUp: true,
  },
  {
    label: "Yield Earned (30d)",
    value: "+$2,745.12",
    icon: Leaf,
    iconClass: "bg-amber-50 dark:bg-amber-600/10 border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500",
    barWidth: "82%",
    barColor: "bg-amber-500",
    deltaValue: "82%",
    deltaLabel: "above target",
    deltaClass: "text-green-600 dark:text-green-500",
    deltaUp: true,
  },
  {
    label: "Liquidity Provided",
    value: "$14,745.21",
    icon: Droplets,
    iconClass: "bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500",
    barWidth: "45%",
    barColor: "bg-green-500",
    deltaValue: "4",
    deltaLabel: "Across pools",
    deltaClass: "text-red-600 dark:text-red-500",
    deltaUp: false,
  },
];

const DefiAnalyticsPane = () => {
  return (
    <div className="grid grid-cols-12 gap-5">
      {cards.map((c) => {
        const Icon = c.icon;
        const DeltaIcon = c.deltaUp ? ArrowUp : ArrowDown;
        return (
          <div key={c.label} className="col-span-12 md:col-span-6 2xl:col-span-4">
            <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full border border-neutral-200 dark:border-neutral-600">
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-12 h-12 border rounded-xl flex items-center justify-center shrink-0 ${c.iconClass}`}>
                  <Icon className="w-6 h-6" />
                </span>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1">{c.label}</span>
                  <h2 className="text-xl font-bold mb-0 text-neutral-900 dark:text-white">{c.value}</h2>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mb-3">
                <div className={`h-full rounded-full ${c.barColor}`} style={{ width: c.barWidth }} />
              </div>
              <div className="flex items-center gap-1">
                <span className={`font-semibold text-sm flex items-center gap-1 ${c.deltaClass}`}>
                  <DeltaIcon className="w-3.5 h-3.5" />{c.deltaValue}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">{c.deltaLabel}</span>
              </div>
            </div>
          </div>
        );
      })}

      <div className="col-span-12">
        <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
          <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
                <Flower className="text-red-600 dark:text-red-500 w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">DeFi Yield Performance</h2>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
                  Compare DeFi staking performance across various blockchain networks
                </span>
              </div>
            </div>
            <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
          </div>
          <CryptoDefiYieldChart />
        </div>
      </div>
    </div>
  );
};

export default DefiAnalyticsPane;
