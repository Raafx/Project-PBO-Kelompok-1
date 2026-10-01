import AnalyticsTotalOrdersChart from "@/components/charts/analytics-total-orders-chart";
import CustomSelect from "@/components/shared/custom-select";
import { ArrowUpDown, ShoppingBag } from "lucide-react";

const TotalOrdersCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <ShoppingBag className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Total Orders</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Complete overview of all customer orders.</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="bg-primary/10 rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">$548.54K</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary px-4 py-2 font-semibold text-xs">
            <ArrowUpDown className="w-3 h-3" />60.2%
          </span>
        </div>
      </div>

      <AnalyticsTotalOrdersChart />

      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Orders</span></div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Refunds</span></div>
      </div>
    </div>
  );
};

export default TotalOrdersCard;
