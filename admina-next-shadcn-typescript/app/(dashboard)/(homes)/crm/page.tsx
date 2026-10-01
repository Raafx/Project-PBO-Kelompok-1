import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import CampaignsCard from "./components/campaigns-card";
import ClientPaymentStatusCard from "./components/client-payment-status-card";
import DashboardHeader from "./components/dashboard-header";
import LeadSourceCard from "./components/lead-source-card";
import LocationBySessionCard from "./components/location-by-session-card";
import SalesOverviewCard from "./components/sales-overview-card";
import StatCards from "./components/stat-cards";
import TopPerformingCard from "./components/top-performing-card";
import TransactionsCard from "./components/transactions-card";

export const metadata: Metadata = {
  title: "CRM Dashboard | Admina Admin Dashboard",
  description:
    "Track leads, deals, revenue, sales overview, lead sources, campaigns, and top performers with the CRM Dashboard in Admina.",
};

const CrmPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="CRM" text="CRM" />

      <div className="grid grid-cols-12 gap-5 mt-6">
        <div className="col-span-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <DashboardHeader />
          </Suspense>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <StatCards />
        </Suspense>

        <div className="col-span-12 2xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <SalesOverviewCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <LeadSourceCard />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <ClientPaymentStatusCard />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <LocationBySessionCard />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <CampaignsCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TopPerformingCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TransactionsCard />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default CrmPage;
