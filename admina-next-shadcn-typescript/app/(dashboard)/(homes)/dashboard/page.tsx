import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import CustomerGrowthCard from "./components/customer-growth-card";
import CustomerSatisfactionCard from "./components/customer-satisfaction-card";
import DeliveryStatusCard from "./components/delivery-status-card";
import OrderSummaryCard from "./components/order-summary-card";
import PaymentMethodsCard from "./components/payment-methods-card";
import QuickActionsCard from "./components/quick-actions-card";
import RecentOrdersCard from "./components/recent-orders-card";
import ReturningClientsCard from "./components/returning-clients-card";
import RevenueByCategoryCard from "./components/revenue-by-category-card";
import RevenueByLocationsCard from "./components/revenue-by-locations-card";
import SalesOverviewCard from "./components/sales-overview-card";
import StatCards from "./components/stat-cards";
import StockAlertsCard from "./components/stock-alerts-card";
import StoreActivityTimelineCard from "./components/store-activity-timeline-card";
import TopCustomersCard from "./components/top-customers-card";
import TopSellersCard from "./components/top-sellers-card";

export const metadata: Metadata = {
  title: "eCommerce Dashboard | Admina Admin Dashboard",
  description:
    "Track revenue, orders, conversion, top customers, delivery status, and store activity with the eCommerce Dashboard in Admina.",
};

const EcommercePage = () => {
  return (
    <>
      <DashboardBreadcrumb title="eCommerce" text="eCommerce" />

      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <StatCards />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <DeliveryStatusCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <ReturningClientsCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <SalesOverviewCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <OrderSummaryCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <RevenueByCategoryCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <TopCustomersCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <TopSellersCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <RevenueByLocationsCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <RecentOrdersCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <PaymentMethodsCard />
            <div className="mt-6">
              <CustomerSatisfactionCard />
            </div>
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <StockAlertsCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <StoreActivityTimelineCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <CustomerGrowthCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <QuickActionsCard />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default EcommercePage;
