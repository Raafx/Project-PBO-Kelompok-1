import CryptoAssetsDonut from "@/components/charts/crypto-assets-donut";
import CustomSelect from "@/components/shared/custom-select";
import { ChartPie, TrendingDown, TrendingUp } from "lucide-react";
import CryptoIcon from "./crypto-icon";

interface Asset {
  name: string;
  symbol: string;
  change: string;
  up: boolean;
  price: string;
}

const assets: Asset[] = [
  { name: "Bitcoin", symbol: "BTC", change: "59.38%", up: true, price: "$ 73.02" },
  { name: "Ethereum", symbol: "ETH", change: "82.06%", up: false, price: "$ 92.93" },
  { name: "Uniswap", symbol: "UNI", change: "56.70%", up: true, price: "$ 4500" },
  { name: "Litecoin -", symbol: "LTC", change: "55.36%", up: true, price: "$ 837.92" },
];

const AssetsAllocationCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <ChartPie className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Assets Allocation</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Allocating funds.</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly"]} />
      </div>

      <div className="relative flex justify-center my-2">
        <CryptoAssetsDonut />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center rounded-full bg-neutral-50 dark:bg-neutral-700 flex flex-col items-center justify-center w-[120px] h-[120px]">
          <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">54785</h2>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">Total Assets</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {assets.map((a) => {
          const Icon = a.up ? TrendingUp : TrendingDown;
          return (
            <div key={a.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <CryptoIcon symbol={a.symbol} size={32} />
                <div>
                  <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{a.name} <span className="text-neutral-500 dark:text-neutral-400 font-normal text-xs">{a.symbol}</span></h2>
                  <span className={`text-xs font-semibold inline-flex items-center gap-1 ${a.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                    <Icon className="w-3 h-3" />{a.change}
                  </span>
                </div>
              </div>
              <span className="text-neutral-900 dark:text-white text-sm font-bold">{a.price}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetsAllocationCard;
