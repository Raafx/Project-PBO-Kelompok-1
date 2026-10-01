import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import InvestmentLocationCard from "./components/investment-location-card";
import InvestmentOverview from "./components/investment-overview";
import InvestmentPortfolioCard from "./components/investment-portfolio-card";
import LatestInvestmentCard from "./components/latest-investment-card";
import PortfolioPerformanceCard from "./components/portfolio-performance-card";

export const metadata: Metadata = {
  title: "Investment Dashboard | Admina Admin Dashboard",
  description:
    "Track your investment portfolio, ROI, profit/loss, portfolio performance, investment locations, and latest investments with the Investment Dashboard in Admina.",
};

const InvestmentPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Investment" text="Investment" />

      <div className="grid grid-cols-12 gap-5 mt-6">
        <div className="col-span-12 2xl:col-span-7">
          <Suspense fallback={<LoadingSkeleton />}>
            <InvestmentPortfolioCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-5">
          <Suspense fallback={<LoadingSkeleton />}>
            <InvestmentOverview />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <PortfolioPerformanceCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <InvestmentLocationCard />
          </Suspense>
        </div>

        <div className="col-span-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <LatestInvestmentCard />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default InvestmentPage;
