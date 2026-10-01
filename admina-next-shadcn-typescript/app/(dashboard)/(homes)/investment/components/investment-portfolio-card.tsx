import InvestmentPortfolioChart from "@/components/charts/investment-portfolio-chart";
import CustomSelect from "@/components/shared/custom-select";
import { HandCoins, PieChart, Plus, TrendingUp } from "lucide-react";

const InvestmentPortfolioCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <HandCoins className="text-green-600 dark:text-green-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Investment Portfolio</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Build a diverse investment portfolio for financial growth.</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="bg-primary/10 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 bg-white dark:bg-[#273142] text-primary rounded-full flex items-center justify-center shrink-0">
              <PieChart className="w-6 h-6" />
            </span>
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1">Total Portfolio Value</span>
              <h2 className="text-2xl font-bold mb-0 text-neutral-900 dark:text-white">$849,545.00</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button type="button" className="bg-white dark:bg-[#273142] border border-primary text-primary hover:bg-primary/10 rounded-full px-5 py-2.5 inline-flex items-center gap-2 text-sm font-medium">
              <PieChart className="w-4 h-4" /> View Report
            </button>
            <button type="button" className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 py-2.5 inline-flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Investment
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-sm">
          <span className="text-green-600 dark:text-green-500 font-semibold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />+75.4%</span>
          <span className="text-neutral-500 dark:text-neutral-400 font-normal">by this week!</span>
        </div>
      </div>

      <InvestmentPortfolioChart />
    </div>
  );
};

export default InvestmentPortfolioCard;
