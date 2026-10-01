import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import CryptoTabs from "./components/crypto-tabs";
import DashboardHeader from "./components/dashboard-header";
import StatCards from "./components/stat-cards";

export const metadata: Metadata = {
  title: "Crypto Dashboard | Admina Admin Dashboard",
  description:
    "Monitor your crypto portfolio, trading bots, asset allocation, DeFi yield, and trade history with the Crypto Dashboard in Admina.",
};

const CryptoPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Crypto" text="Crypto" />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <DashboardHeader />
          </Suspense>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <StatCards />
        </Suspense>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <CryptoTabs />
      </Suspense>
    </>
  );
};

export default CryptoPage;
