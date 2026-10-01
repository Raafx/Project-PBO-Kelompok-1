import AnalyticsSessionsOverviewChart from "@/components/charts/analytics-sessions-overview-chart";
import { BarChart3 } from "lucide-react";
import PeriodTabs from "./period-tabs";

const PortfolioPerformanceCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-4 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
            <BarChart3 className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Portfolio Performance</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Comprehensive value tracking across all asset classes available today.
            </span>
          </div>
        </div>
        <PeriodTabs />
      </div>

      <AnalyticsSessionsOverviewChart />

      <div className="flex items-center justify-center gap-6 mt-3 pt-4 border-t border-neutral-200 dark:border-neutral-600">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Portfolio A</span></div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Benchmark</span></div>
      </div>
    </div>
  );
};

export default PortfolioPerformanceCard;
