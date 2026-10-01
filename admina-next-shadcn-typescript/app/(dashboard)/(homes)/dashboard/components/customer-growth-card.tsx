import EcommerceCustomerGrowthChart from "@/components/charts/ecommerce-customer-growth-chart";
import CustomSelect from "@/components/shared/custom-select";
import { UserRoundSearch } from "lucide-react";

const CustomerGrowthCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] mb-6">
      <div className="flex items-start justify-between gap-2 pb-5 mb-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
            <UserRoundSearch className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Customer Growth</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Measure customer growth rate and engagement from recent sales activity.
            </span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year", "Today"]} />
      </div>
      <EcommerceCustomerGrowthChart />
    </div>
  );
};

export default CustomerGrowthCard;
