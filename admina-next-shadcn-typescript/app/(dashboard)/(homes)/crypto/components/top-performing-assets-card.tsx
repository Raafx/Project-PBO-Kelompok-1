import { ArrowRight, Coins } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";
import CryptoIcon from "./crypto-icon";

interface Asset {
  name: string;
  symbol: string;
  amount: string;
  price: string;
  change: string;
  up: boolean;
}

const assets: Asset[] = [
  { name: "Bitcoin", symbol: "BTC", amount: "2.45 BTC", price: "$ 839", change: "+8.42%", up: true },
  { name: "Ethereum", symbol: "ETH", amount: "18.2 ETH", price: "$ 837.92", change: "+8.42%", up: true },
  { name: "Avalanche", symbol: "AVAX", amount: "156 AVAX", price: "$ 92.93", change: "-2.15%", up: false },
  { name: "Solana", symbol: "SOL", amount: "142 SOL", price: "$ 45.99", change: "-2.15%", up: false },
  { name: "Chainlink", symbol: "LINK", amount: "485 LINK", price: "$ 783.83", change: "+8.42%", up: true },
];

const TopPerformingAssetsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] rounded-[20px] p-6 h-full">
      <div className="flex items-start justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <Coins className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Top Performing Assets</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Overall best customer growth</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex flex-col">
        {assets.map((a) => (
          <div key={a.name} className="flex items-center justify-between gap-3 py-2.5 px-4 rounded-2xl border border-transparent hover:bg-neutral-100 dark:hover:bg-slate-700 transition">
            <div className="flex items-center gap-3">
              <CryptoIcon symbol={a.symbol} />
              <div>
                <h2 className="text-base font-bold mb-0 text-neutral-900 dark:text-white">{a.name}</h2>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">{a.amount}</span>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold mb-0 text-neutral-900 dark:text-white">{a.price}</h2>
              <span className={`text-sm font-semibold ${a.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{a.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All Assets <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TopPerformingAssetsCard;
