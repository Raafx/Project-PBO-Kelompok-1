import CryptoStatsCandlestick from "@/components/charts/crypto-stats-candlestick";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import PeriodTabs from "./period-tabs";

const stats = [
  { label: "Coin Marketcap", box: "bg-purple-50 dark:bg-purple-600/10", value: "11.54%", up: true },
  { label: "Coinbase", box: "bg-amber-50 dark:bg-amber-600/10", value: "9.475%", up: false },
  { label: "Ethereum", box: "bg-red-50 dark:bg-red-600/10", value: "10.124%", up: false },
  { label: "Binance", box: "bg-green-50 dark:bg-green-600/10", value: "12.63%", up: true },
];

const CryptoStatisticsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <BarChart3 className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Crypto Statistics</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Uncover today&apos;s top cryptocurrency trends.</span>
          </div>
        </div>
        <PeriodTabs />
      </div>

      <CryptoStatsCandlestick />

      <div className="grid grid-cols-2 gap-2 mt-4">
        {stats.map((s) => {
          const Icon = s.up ? TrendingUp : TrendingDown;
          return (
            <div key={s.label} className={`flex items-center justify-between rounded-lg px-4 py-3 ${s.box}`}>
              <span className="text-neutral-500 dark:text-neutral-300 text-sm font-medium">{s.label}</span>
              <span className={`text-sm font-semibold inline-flex items-center gap-1 ${s.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                <Icon className="w-3.5 h-3.5" />{s.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoStatisticsCard;
