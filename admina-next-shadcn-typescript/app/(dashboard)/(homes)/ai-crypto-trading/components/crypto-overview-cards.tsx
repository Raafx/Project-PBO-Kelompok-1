import CryptoLineSpark from "@/components/charts/crypto-line-spark";
import { ArrowUpDown } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";
import CryptoIcon from "./crypto-icon";

interface Coin {
  symbol: string;
  name: string;
  value: string;
  badgeClass: string;
  data: number[];
  color: string;
}

const coins: Coin[] = [
  { symbol: "ADA", name: "Cardano", value: "5.245 ADA", badgeClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500", data: [18, 22, 19, 24, 21, 27, 25, 30, 28, 34], color: "#4F46E5" },
  { symbol: "ETH", name: "Ethereum", value: "5.245 ADA", badgeClass: "bg-primary/10 text-primary", data: [15, 18, 16, 20, 19, 24, 22, 27, 25, 30], color: "#22c55e" },
  { symbol: "USDT", name: "Tether", value: "5.245 ADA", badgeClass: "bg-primary/10 text-primary", data: [30, 26, 28, 22, 25, 20, 24, 18, 21, 16], color: "#ef4444" },
  { symbol: "BTC", name: "Bitcoin", value: "5.245 ADA", badgeClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500", data: [26, 30, 24, 28, 22, 26, 20, 24, 18, 22], color: "#a16207" },
];

const CryptoOverviewCards = () => {
  return (
    <>
      {coins.map((coin) => (
        <div key={coin.symbol} className="col-span-12 md:col-span-6 2xl:col-span-3">
          <div className="bg-white dark:bg-[#273142] p-5 rounded-2xl h-full">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <CryptoIcon symbol={coin.symbol} />
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium block">{coin.symbol}</span>
                  <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">{coin.name}</h2>
                </div>
              </div>
              <CardDropdown />
            </div>
            <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">{coin.value}</h2>
            <div className="flex items-center justify-between gap-2 mt-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold text-xs ${coin.badgeClass}`}>
                <ArrowUpDown className="w-3 h-3" />60.2%
              </span>
              <div className="w-[100px] shrink-0">
                <CryptoLineSpark data={coin.data} color={coin.color} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default CryptoOverviewCards;
