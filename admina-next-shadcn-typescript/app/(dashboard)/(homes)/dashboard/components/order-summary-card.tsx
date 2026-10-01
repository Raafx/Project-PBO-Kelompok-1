import EcommerceOrderSummaryChart from "@/components/charts/ecommerce-order-summary-chart";
import { ShoppingBag } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const legend = [
  { label: "Completed", color: "bg-primary" },
  { label: "New Order", color: "bg-cyan-600" },
  { label: "Pending", color: "bg-red-400" },
];

const OrderSummaryCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-center justify-between gap-2 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-600/10 border border-cyan-100 dark:border-cyan-600/20 rounded-full flex items-center justify-center">
            <ShoppingBag className="text-cyan-600 dark:text-cyan-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Order Summary</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Orders overview snapshot</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <EcommerceOrderSummaryChart />

      <ul className="flex items-center justify-center gap-4 mt-3 flex-wrap">
        {legend.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={`shrink-0 w-1.5 h-1.5 ${item.color} rounded-full`} />
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderSummaryCard;
