import FinanceMarketingInnerChart from "@/components/charts/finance-marketing-inner-chart";
import FinanceMarketingOuterChart from "@/components/charts/finance-marketing-outer-chart";
import { Megaphone } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const col1 = [
  { label: "Email", color: "bg-primary" },
  { label: "Influencer", style: "#1f2937" },
  { label: "Google Ads", style: "#84cc16" },
  { label: "Social Media", style: "#06b6d4" },
  { label: "Back Links", style: "#22d3ee" },
  { label: "Events", style: "#facc15" },
];

const col2 = [
  { label: "Ad Campaign", style: "#f87171" },
  { label: "Revenue", color: "bg-primary" },
  { label: "Audit Report", style: "#22c55e" },
  { label: "Sponsorship", style: "#d946ef" },
  { label: "Marketing", style: "#f97316" },
];

const Dot = ({ item }: { item: { color?: string; style?: string } }) => (
  <span className={`w-2 h-2 rounded-full shrink-0 ${item.color ?? ""}`} style={item.style ? { background: item.style } : undefined} />
);

const MarketingExpensesCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <Megaphone className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Marketing Expenses</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">A crucial part of our budget plan</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative w-[200px] shrink-0">
          <FinanceMarketingOuterChart />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px]">
            <FinanceMarketingInnerChart />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 grow min-w-[160px]">
          <div className="flex flex-col gap-4">
            {col1.map((i) => (
              <div key={i.label} className="flex items-center gap-2">
                <Dot item={i} />
                <span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">{i.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {col2.map((i) => (
              <div key={i.label} className="flex items-center gap-2">
                <Dot item={i} />
                <span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingExpensesCard;
