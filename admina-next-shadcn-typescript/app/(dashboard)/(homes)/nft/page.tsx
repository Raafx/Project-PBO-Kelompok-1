import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import HistoryOfBidsCard from "./components/history-of-bids-card";
import MarketplaceCard from "./components/marketplace-card";
import NftDetailCard from "./components/nft-detail-card";
import NftHeroCard from "./components/nft-hero-card";
import RecentNftTableCard from "./components/recent-nft-table-card";
import StatCards from "./components/stat-cards";
import TopArtworksCard from "./components/top-artworks-card";
import TrendingBidsCard from "./components/trending-bids-card";

export const metadata: Metadata = {
  title: "NFT Dashboard | Admina Admin Dashboard",
  description:
    "Discover, collect and sell NFTs — track marketplace volume, trending bids, top artworks, live auctions and exclusive collections with the NFT Dashboard in Admina.",
};

const NftPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="NFT" text="NFT" />

      <div className="mt-6">
        {/* Hero banner + Stat cards */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <NftHeroCard />
            </Suspense>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <StatCards />
            </Suspense>
          </div>
        </div>

        {/* Marketplace + NFT Detail */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12 lg:col-span-7 2xl:col-span-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <MarketplaceCard />
            </Suspense>
          </div>
          <div className="col-span-12 lg:col-span-5 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <NftDetailCard />
            </Suspense>
          </div>
        </div>

        {/* Trending Bids + History of Bids */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12 lg:col-span-7 2xl:col-span-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <TrendingBidsCard />
            </Suspense>
          </div>
          <div className="col-span-12 lg:col-span-5 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <HistoryOfBidsCard />
            </Suspense>
          </div>
        </div>

        {/* Top Artworks + Recent Exclusive NFTs */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12 lg:col-span-5 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <TopArtworksCard />
            </Suspense>
          </div>
          <div className="col-span-12 lg:col-span-7 2xl:col-span-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <RecentNftTableCard />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};

export default NftPage;
