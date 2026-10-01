import CryptoBrowserActivityCard from "@/app/(dashboard)/(homes)/ai-crypto-trading/components/browser-activity-card";
import RecentTransactionsCard from "@/app/(dashboard)/(homes)/ai-crypto-trading/components/recent-transactions-card";
import TopRevenueChannelsCard from "@/app/(dashboard)/(homes)/ai-crypto-trading/components/top-revenue-channels-card";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import RecentOrdersCard from "./components/recent-orders-card";
import SalesHeader from "./components/sales-header";
import SalesRevenueCard from "./components/sales-revenue-card";
import StatCards from "./components/stat-cards";
import TopAudienceLocationsCard from "./components/top-audience-locations-card";
import TopCategoriesCard from "./components/top-categories-card";
import UpcomingSalesCard from "./components/upcoming-sales-card";
import VisitorsByDeviceCard from "./components/visitors-by-device-card";

export const metadata: Metadata = {
  title: "Sales Dashboard | Admina Admin Dashboard",
  description:
    "Track sales, revenue, visitors by device, top categories, audience locations, and recent orders with the Sales Dashboard in Admina.",
};

const SalesPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Sales" text="Sales" />

      <div className="mt-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <SalesHeader />
        </Suspense>

        {/* Stat cards */}
        <div className="grid grid-cols-12 gap-5">
          <Suspense fallback={<LoadingSkeleton />}>
            <StatCards />
          </Suspense>
        </div>

        {/* Visitors By Device + Sales Revenue */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12 lg:col-span-5 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <VisitorsByDeviceCard />
            </Suspense>
          </div>
          <div className="col-span-12 lg:col-span-7 2xl:col-span-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <SalesRevenueCard />
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

        {/* Upcoming Sales + Top Categories + Top Audience Locations */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12 2xl:col-span-4">
            <Suspense fallback={<LoadingSkeleton />}>
              <UpcomingSalesCard />
            </Suspense>
          </div>
          <div className="col-span-12 2xl:col-span-8">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12">
                <Suspense fallback={<LoadingSkeleton />}>
                  <TopCategoriesCard />
                </Suspense>
              </div>
              <div className="col-span-12">
                <Suspense fallback={<LoadingSkeleton />}>
                  <TopAudienceLocationsCard />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-12 gap-5 mt-5">
          <div className="col-span-12">
            <Suspense fallback={<LoadingSkeleton />}>
              <RecentOrdersCard />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesPage;
