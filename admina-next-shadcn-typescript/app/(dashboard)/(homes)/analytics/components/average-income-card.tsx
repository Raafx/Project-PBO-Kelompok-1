import AnalyticsAverageIncomeChart from "@/components/charts/analytics-average-income-chart";
import CustomSelect from "@/components/shared/custom-select";
import { ArrowUp, PiggyBank, Wallet } from "lucide-react";

const AverageIncomeCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <PiggyBank className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Average Income</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">See income performance at a glance</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="-mt-6">
        <AnalyticsAverageIncomeChart />
      </div>

      <div className="flex items-center justify-between gap-2 bg-primary/10 rounded-2xl p-4 mt-5">
        <div className="flex items-center gap-3">
          <div className="w-[50px] h-[50px] bg-white dark:bg-[#273142] rounded-full flex items-center justify-center shrink-0">
            <Wallet className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-base text-neutral-900 dark:text-white">Total Income</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Overall earnings from all sources</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">$845,245</h2>
          <span className="text-green-600 dark:text-green-500 text-sm font-medium flex items-center gap-1 justify-end">
            <ArrowUp className="w-3 h-3" />92.4% Avg
          </span>
        </div>
      </div>
    </div>
  );
};

export default AverageIncomeCard;
