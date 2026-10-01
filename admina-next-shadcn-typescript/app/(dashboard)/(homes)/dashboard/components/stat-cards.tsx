import EcommerceConversionRadialChart from "@/components/charts/ecommerce-conversion-radial-chart";
import EcommerceCustomersColumnChart from "@/components/charts/ecommerce-customers-column-chart";
import EcommerceOrdersAreaChart from "@/components/charts/ecommerce-orders-area-chart";
import EcommerceRevenueBarChart from "@/components/charts/ecommerce-revenue-bar-chart";
import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpDown } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const cardClass =
  "bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full";

const StatCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* Total Revenue */}
      <div className={cardClass}>
        <div className="flex items-center justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600">
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">Total Revenue</span>
          <CardDropdown />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl mb-0 text-neutral-900 dark:text-white">$124,563</h2>
            <div className="mt-4 flex items-center gap-1 text-primary">
              <ArrowUp className="w-4 h-4" />
              <span className="font-medium">92.4% Avg</span>
            </div>
          </div>
          <EcommerceRevenueBarChart />
        </div>
      </div>

      {/* Total Orders */}
      <div className={cardClass}>
        <div className="flex items-center justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600">
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">Total Orders</span>
          <CardDropdown />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl mb-0 text-neutral-900 dark:text-white">18,425</h2>
            <div className="mt-4 flex items-center gap-1 text-amber-600 dark:text-amber-500">
              <ArrowUpDown className="w-4 h-4" />
              <span className="font-medium">60.2% Avg</span>
            </div>
          </div>
          <div className="w-[140px]">
            <EcommerceOrdersAreaChart />
          </div>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className={cardClass}>
        <div className="flex items-center justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600">
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">Conversion Rate</span>
          <CardDropdown />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl mb-0 text-neutral-900 dark:text-white">35.5%</h2>
            <div className="mt-4 flex items-center gap-1 text-red-600 dark:text-red-500">
              <ArrowDown className="w-4 h-4" />
              <span className="font-medium">09.4% Avg</span>
            </div>
          </div>
          <div className="-m-2">
            <EcommerceConversionRadialChart />
          </div>
        </div>
      </div>

      {/* Total Customers */}
      <div className={cardClass}>
        <div className="flex items-center justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600">
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">Total Customers</span>
          <CardDropdown />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl mb-0 text-neutral-900 dark:text-white">58,426</h2>
            <div className="mt-4 flex items-center gap-1 text-green-600 dark:text-green-500">
              <ArrowDownRight className="w-4 h-4" />
              <span className="font-medium">44.7% Avg</span>
            </div>
          </div>
          <div className="w-[140px]">
            <EcommerceCustomersColumnChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;
