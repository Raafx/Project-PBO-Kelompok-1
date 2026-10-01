import EcommerceSalesOverviewChart from "@/components/charts/ecommerce-sales-overview-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Tag } from "lucide-react";

const SalesOverviewCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <Tag className="text-green-600 dark:text-green-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Sales Overview</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Easily manage customer information and order updates while keeping sales records.
            </span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year", "Today"]} />
      </div>
      <div className="flex gap-4 md:flex-nowrap flex-wrap">
        <div className="flex flex-col gap-3 shrink-0">
          <div className="border border-primary/20 bg-primary/10 rounded-xl p-4 min-w-[140px]">
            <div className="border-l-2 border-primary ps-4">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-0">5,458</h2>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm">Sales Amount</span>
            </div>
          </div>
          <div className="border border-amber-200 dark:border-amber-600/20 bg-amber-100 dark:bg-amber-600/10 rounded-xl p-4 min-w-[140px]">
            <div className="border-l-2 border-amber-600 ps-4">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-0">1,254</h2>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm">Active Orders</span>
            </div>
          </div>
        </div>
        <div className="grow">
          <div className="-my-4">
            <EcommerceSalesOverviewChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOverviewCard;
