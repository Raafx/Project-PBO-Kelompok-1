import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import ActivitiesCard from "./components/activities-card";
import AssetsAllocationCard from "./components/assets-allocation-card";
import CryptoBrowserActivityCard from "./components/browser-activity-card";
import CryptoHeader from "./components/crypto-header";
import CryptoOverviewCards from "./components/crypto-overview-cards";
import CryptoStatisticsCard from "./components/crypto-statistics-card";
import CurrencyConverterCard from "./components/currency-converter-card";
import DailyAverageOverview from "./components/daily-average-overview";
import MarketCapCard from "./components/market-cap-card";
import MarketOverviewCard from "./components/market-overview-card";
import RecentTransactionsCard from "./components/recent-transactions-card";
import TopRevenueChannelsCard from "./components/top-revenue-channels-card";
import TransactionsCard from "./components/transactions-card";

export const metadata: Metadata = {
  title: "AI Crypto Trading Dashboard | Admina Admin Dashboard",
  description:
    "Track crypto coins, statistics, allocation, market cap, daily averages, transactions, and market overview with the Crypto Dashboard in Admina.",
};

const CryptoMainPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Crypto" text="Crypto" />

      <div className="mt-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <CryptoHeader />
        </Suspense>

        {/* Crypto Overview coin cards */}
        <div className="grid grid-cols-12 gap-5">
          <Suspense fallback={<LoadingSkeleton />}>
            <CryptoOverviewCards />
          </Suspense>
        </div>

        {/* Statistics + Allocation + Converter */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12 lg:col-span-7 2xl:col-span-5">
            <Suspense fallback={<LoadingSkeleton />}>
              <CryptoStatisticsCard />
            </Suspense>
          </div>
          <div className="col-span-12 lg:col-span-5 2xl:col-span-3">
            <Suspense fallback={<LoadingSkeleton />}>
              <AssetsAllocationCard />
            </Suspense>
          </div>
          <div className="col-span-12 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <CurrencyConverterCard />
            </Suspense>
          </div>
        </div>

        {/* Daily Average Overview + Market Cap */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12 2xl:col-span-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <DailyAverageOverview />
            </Suspense>
          </div>
          <div className="col-span-12 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <MarketCapCard />
            </Suspense>
          </div>
        </div>

        {/* Activities + Transactions */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12 2xl:col-span-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <ActivitiesCard />
            </Suspense>
          </div>
          <div className="col-span-12 2xl:col-span-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <TransactionsCard />
            </Suspense>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12">
            <Suspense fallback={<LoadingSkeleton />}>
              <MarketOverviewCard />
            </Suspense>
          </div>
        </div>

        {/* Browser Activity + Recent Transactions + Top Revenue Channels */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12 lg:col-span-6 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <CryptoBrowserActivityCard />
            </Suspense>
          </div>
          <div className="col-span-12 lg:col-span-6 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <RecentTransactionsCard />
            </Suspense>
          </div>
          <div className="col-span-12 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <TopRevenueChannelsCard />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};

export default CryptoMainPage;
