import CryptoPortfolioPerformanceChart from "@/components/charts/crypto-portfolio-performance-chart";
import CustomSelect from "@/components/shared/custom-select";
import { LineChart } from "lucide-react";

const PortfolioPerformanceCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] h-full rounded-[20px]">
      <div className="py-4 px-6 border-b border-neutral-200 dark:border-neutral-600">
        <div className="flex items-start flex-wrap gap-3 justify-between">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-lg inline-flex justify-center items-center bg-primary/10 text-primary shrink-0">
              <LineChart className="w-5 h-5" />
            </span>
            <div>
              <h2 className="mb-1 font-bold text-lg text-neutral-900 dark:text-white">Portfolio Performance</h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-0 text-sm">
                Cumulative returns over time can significantly impact your investment strategy
              </p>
            </div>
          </div>
          <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year", "Today"]} />
        </div>
      </div>
      <div className="p-6">
        <CryptoPortfolioPerformanceChart />
      </div>
    </div>
  );
};

export default PortfolioPerformanceCard;
