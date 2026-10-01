import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import AudienceOverviewCard from "./components/audience-overview-card";
import AverageIncomeCard from "./components/average-income-card";
import BrowserUsedCard from "./components/browser-used-card";
import DailyVisitInsightsCard from "./components/daily-visit-insights-card";
import ImpressionsClicksCard from "./components/impressions-clicks-card";
import PerformanceOverviewCard from "./components/performance-overview-card";
import RecentOrdersCard from "./components/recent-orders-card";
import SessionsOverviewCard from "./components/sessions-overview-card";
import StatCards from "./components/stat-cards";
import SupportTrackerCard from "./components/support-tracker-card";
import TopBrowsingPagesCard from "./components/top-browsing-pages-card";
import TopTrafficSourcesCard from "./components/top-traffic-sources-card";
import TotalOrdersCard from "./components/total-orders-card";
import TotalSubscribersCard from "./components/total-subscribers-card";
import TransactionsCard from "./components/transactions-card";
import UpgradeBanner from "./components/upgrade-banner";
import UserByDeviceCard from "./components/user-by-device-card";
import VisitsByCountryCard from "./components/visits-by-country-card";

export const metadata: Metadata = {
  title: "Analytics Dashboard | Admina Admin Dashboard",
  description:
    "Track visitors, sessions, traffic sources, audience, and performance analytics with the Analytics Dashboard in Admina.",
};

const AnalyticsPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Analytics" text="Analytics" />

      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <UpgradeBanner />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <StatCards />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <div className="flex flex-col gap-6 h-full">
            <Suspense fallback={<LoadingSkeleton />}>
              <AudienceOverviewCard />
              <ImpressionsClicksCard />
            </Suspense>
          </div>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TotalSubscribersCard />
          </Suspense>
        </div>

        <div className="col-span-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <SessionsOverviewCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <SupportTrackerCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <AverageIncomeCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <TransactionsCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <BrowserUsedCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TopTrafficSourcesCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <PerformanceOverviewCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <TopBrowsingPagesCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TotalOrdersCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <UserByDeviceCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <VisitsByCountryCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <DailyVisitInsightsCard />
          </Suspense>
        </div>

        <div className="col-span-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <RecentOrdersCard />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;
