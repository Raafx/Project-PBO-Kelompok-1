"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Filter, RefreshCw } from "lucide-react";
import ActiveTradingBots from "./active-trading-bots";
import AssetAllocationCard from "./asset-allocation-card";
import BotPerformanceCard from "./bot-performance-card";
import DefiAnalyticsPane from "./defi-analytics-pane";
import PortfolioHoldingsCard from "./portfolio-holdings-card";
import PortfolioPerformanceCard from "./portfolio-performance-card";
import RecentActivityCard from "./recent-activity-card";
import RecentTradesCard from "./recent-trades-card";
import TopPerformingAssetsCard from "./top-performing-assets-card";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "bot-performance", label: "Bot Performance" },
  { value: "portfolio", label: "Portfolio" },
  { value: "defi-analytics", label: "DeFi Analytics" },
  { value: "recent-trades", label: "Recent Trades" },
];

const triggerClass =
  "px-5 py-2 rounded-full text-sm font-medium transition text-neutral-900 dark:text-white data-[state=active]:bg-primary data-[state=active]:text-white cursor-pointer";

const CryptoTabs = () => {
  return (
    <Tabs defaultValue="overview" className="mt-6 gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList className="inline-flex flex-wrap gap-2 border border-neutral-300 dark:border-neutral-600 p-1 rounded-full bg-transparent dark:bg-transparent h-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={triggerClass}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-white dark:bg-[#273142] text-neutral-500 dark:text-neutral-300 rounded-full px-5 py-2.5 inline-flex items-center gap-2 text-sm font-medium outline-none">
              <Filter className="text-primary w-4 h-4" />
              Filter
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {["All Assets", "Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)"].map((item) => (
                <DropdownMenuItem key={item} className="cursor-pointer">{item}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            className="bg-white dark:bg-[#273142] text-neutral-500 dark:text-neutral-300 rounded-full px-5 py-2.5 inline-flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="text-red-600 dark:text-red-500 w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <TabsContent value="overview">
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 2xl:col-span-8">
            <PortfolioPerformanceCard />
          </div>
          <div className="col-span-12 2xl:col-span-4">
            <AssetAllocationCard />
          </div>
        </div>

        <ActiveTradingBots />

        <div className="grid grid-cols-12 gap-5 mt-6">
          <div className="col-span-12 2xl:col-span-6">
            <TopPerformingAssetsCard />
          </div>
          <div className="col-span-12 2xl:col-span-6">
            <RecentActivityCard />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="bot-performance">
        <BotPerformanceCard />
      </TabsContent>

      <TabsContent value="portfolio">
        <PortfolioHoldingsCard />
      </TabsContent>

      <TabsContent value="defi-analytics">
        <DefiAnalyticsPane />
      </TabsContent>

      <TabsContent value="recent-trades">
        <RecentTradesCard />
      </TabsContent>
    </Tabs>
  );
};

export default CryptoTabs;
