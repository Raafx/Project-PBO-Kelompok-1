import NftMarketplaceChart from "@/components/charts/nft-marketplace-chart";
import { BarChart3, Hourglass, Palette, TrendingUp } from "lucide-react";
import NftPeriodTabs from "./period-tabs";

const legend = [
  { label: "Artworks", color: "#7c5cfc" },
  { label: "Auction", color: "#facc15" },
];

const MarketplaceCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 h-full">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-purple-100 dark:bg-purple-600/20 flex items-center justify-center rounded-full text-purple-600 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Marketplace</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Explore a vibrant marketplace for unique NFTs and digital collectibles today!
            </span>
          </div>
        </div>
        <NftPeriodTabs />
      </div>

      <div className="grid grid-cols-2 border-y border-neutral-200 dark:border-neutral-600">
        <div className="border-e border-neutral-200 dark:border-neutral-600 py-4 px-2">
          <div className="flex items-center justify-center gap-3">
            <span className="w-11 h-11 bg-purple-100 dark:bg-purple-600/20 flex items-center justify-center rounded-full text-purple-600 shrink-0">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">36.48k</h2>
                <span className="text-green-600 dark:text-green-500 text-xs font-semibold inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                </span>
              </div>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Artworks</span>
            </div>
          </div>
        </div>
        <div className="py-4 px-2">
          <div className="flex items-center justify-center gap-3">
            <span className="w-11 h-11 bg-amber-50 dark:bg-amber-600/10 flex items-center justify-center rounded-full text-amber-600 dark:text-amber-500 shrink-0">
              <Hourglass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">92.54k</h2>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Auction</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <NftMarketplaceChart />
      </div>

      <div className="flex items-center justify-center flex-wrap gap-6 mt-2">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceCard;
