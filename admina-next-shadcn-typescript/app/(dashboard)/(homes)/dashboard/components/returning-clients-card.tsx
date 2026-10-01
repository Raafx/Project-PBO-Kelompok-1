import EcommerceReturningClientsChart from "@/components/charts/ecommerce-returning-clients-chart";
import { ArrowUp, Users } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const ReturningClientsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-center justify-between gap-2 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-100 dark:border-red-600/20 rounded-full flex items-center justify-center">
            <Users className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Returning Clients</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Customer retention rate</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="mb-5 text-center">
        <h2 className="text-[40px] font-semibold mb-2 text-neutral-900 dark:text-white">85%</h2>
        <div className="inline-flex items-center gap-2 text-primary">
          <ArrowUp className="w-4 h-4" />
          <span className="font-medium">+5.2% from last month</span>
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-600">
        <div className="-mt-4">
          <EcommerceReturningClientsChart />
        </div>
      </div>
    </div>
  );
};

export default ReturningClientsCard;
