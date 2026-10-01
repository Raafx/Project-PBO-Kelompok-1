import CryptoAssetAllocationChart from "@/components/charts/crypto-asset-allocation-chart";
import { PieChart } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const legend = [
  { label: "BTC", color: "bg-primary", value: "48%" },
  { label: "ETH", color: "bg-green-600", value: "12%" },
  { label: "SOL", color: "bg-amber-600", value: "25%" },
  { label: "Others", color: "bg-cyan-600", value: "15%" },
];

const AssetAllocationCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] h-full rounded-[20px]">
      <div className="py-4 px-6 border-b border-neutral-200 dark:border-neutral-600">
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-lg inline-flex justify-center items-center bg-purple-100 dark:bg-purple-600/20 text-purple-600 shrink-0">
              <PieChart className="w-5 h-5" />
            </span>
            <div>
              <h2 className="mb-1 font-bold text-lg text-neutral-900 dark:text-white">Asset Allocation</h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-0 text-sm">Streamlined portfolio allocation</p>
            </div>
          </div>
          <CardDropdown />
        </div>
      </div>
      <div className="p-6">
        <div className="relative z-[1]">
          <CryptoAssetAllocationChart />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] flex flex-col justify-center items-center bg-neutral-50 dark:bg-neutral-700 rounded-full">
            <h2 className="text-xl text-neutral-900 dark:text-white mb-1 font-semibold">4576</h2>
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Total Crypto</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{item.label}</span>
              </div>
              <span className="text-neutral-900 dark:text-white font-semibold text-sm">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocationCard;
