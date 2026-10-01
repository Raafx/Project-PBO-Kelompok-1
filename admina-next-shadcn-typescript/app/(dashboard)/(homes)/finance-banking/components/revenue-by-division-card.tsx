import FinanceRevenueDivisionChart from "@/components/charts/finance-revenue-division-chart";
import CustomSelect from "@/components/shared/custom-select";
import { PieChart } from "lucide-react";

const legend = [
  { label: "Capital Solution", color: "bg-primary" },
  { label: "Credits Strategies", style: "#22c55e" },
  { label: "Fund Strategies", style: "#06b6d4" },
  { label: "Capital Opportunities", style: "#facc15" },
];

const RevenueByDivisionCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-full flex items-center justify-center shrink-0">
            <PieChart className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Revenue By Division</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Revenue By Division Overview Report</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="flex justify-center">
        <FinanceRevenueDivisionChart />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 pt-4 border-t border-neutral-200 dark:border-neutral-600">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${l.color ?? ""}`} style={l.style ? { background: l.style } : undefined} />
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueByDivisionCard;
