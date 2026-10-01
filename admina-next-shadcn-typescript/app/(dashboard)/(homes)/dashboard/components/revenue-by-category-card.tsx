import EcommerceRevenueCategoryChart from "@/components/charts/ecommerce-revenue-category-chart";
import { ShoppingBag } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const legend = [
  { label: "Fashion", color: "bg-primary" },
  { label: "Beauty", color: "bg-red-400" },
  { label: "Medical", color: "bg-cyan-600" },
  { label: "Sports", color: "bg-purple-500" },
  { label: "Electronics", color: "bg-green-600" },
  { label: "Furniture", color: "bg-amber-400" },
];

const RevenueByCategoryCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-center justify-between gap-2 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-100 dark:border-amber-600/20 rounded-full flex items-center justify-center">
            <ShoppingBag className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Revenue by Category</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Revenue breakdown</span>
          </div>
        </div>
        <CardDropdown />
      </div>
      <div className="relative">
        <EcommerceRevenueCategoryChart />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <span className="text-neutral-400 text-sm block">Total Products</span>
          <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">25.59K</h2>
        </div>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
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

export default RevenueByCategoryCard;
