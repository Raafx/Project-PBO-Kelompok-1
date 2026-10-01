import AnalyticsDailyVisitInsightsChart from "@/components/charts/analytics-daily-visit-insights-chart";
import CustomSelect from "@/components/shared/custom-select";
import { BarChart3 } from "lucide-react";

const DailyVisitInsightsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-full flex items-center justify-center shrink-0">
            <BarChart3 className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Daily Visit Insights</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Daily traffic breakdown to optimize performance</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <AnalyticsDailyVisitInsightsChart />

      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Male</span></div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#facc15" }} /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Female</span></div>
      </div>
    </div>
  );
};

export default DailyVisitInsightsCard;
