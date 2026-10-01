import { ArrowRight, BarChart3 } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";
import CryptoIcon from "./crypto-icon";

interface Coin {
  name: string;
  symbol: string;
  change: string;
  up: boolean;
  usd: string;
  amount: string;
  price: string;
  priceChange: string;
}

const coins: Coin[] = [
  { name: "Bitcoin", symbol: "BTC", change: "+02.3015%", up: true, usd: "0.415164 USD", amount: "0.009231298 BTC", price: "$84.50", priceChange: "+1,25.95" },
  { name: "Ethereum", symbol: "ETH", change: "-2.10%", up: false, usd: "58.75 USD", amount: "0.035671238 ETH", price: "$6.75", priceChange: "-1,74.21" },
  { name: "Ripple", symbol: "XRP", change: "+3.25%", up: true, usd: "0.75 USD", amount: "150.324 XRP", price: "$2,450.00", priceChange: "+1,25.95" },
  { name: "Cardano", symbol: "ADA", change: "-1.15%", up: false, usd: "1.50 USD", amount: "200.546 ADA", price: "$15.00", priceChange: "-1,74.21" },
  { name: "Ethereum", symbol: "ETH", change: "-2.10%", up: false, usd: "58.75 USD", amount: "0.035671238 ETH", price: "$6.75", priceChange: "-1,74.21" },
  { name: "Litecoin", symbol: "LTC", change: "+1.80%", up: true, usd: "90.10 USD", amount: "0.075345 LTC", price: "$12.99", priceChange: "+1,25.95" },
];

const MarketCapCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <BarChart3 className="text-green-600 dark:text-green-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Market Cap</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Total value of all shares combined.</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-700">
        {coins.map((c, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-3 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-700">
            <div className="flex items-center gap-2.5 grow min-w-0">
              <CryptoIcon symbol={c.symbol} size={36} />
              <div>
                <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{c.name}</h2>
                <span className={`text-xs font-semibold ${c.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{c.change}</span>
              </div>
            </div>
            <div className="text-right min-w-[96px]">
              <span className="block text-sm font-semibold text-neutral-900 dark:text-white leading-none mb-1">{c.usd}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{c.amount}</span>
            </div>
            <div className="text-right min-w-[74px]">
              <span className="block text-sm font-bold text-neutral-900 dark:text-white leading-none mb-1">{c.price}</span>
              <span className={`text-xs font-semibold ${c.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{c.priceChange}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium w-fit">
          See More <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MarketCapCard;
