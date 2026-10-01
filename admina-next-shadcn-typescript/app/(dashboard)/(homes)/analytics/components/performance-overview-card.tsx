import AnalyticsPerformanceOverviewChart from "@/components/charts/analytics-performance-overview-chart";
import CustomSelect from "@/components/shared/custom-select";
import { PieChart } from "lucide-react";

const PerformanceOverviewCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <PieChart className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Performance Overview</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Evaluate performance across all channels and metrics</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>
      <AnalyticsPerformanceOverviewChart />
    </div>
  );
};

export default PerformanceOverviewCard;
