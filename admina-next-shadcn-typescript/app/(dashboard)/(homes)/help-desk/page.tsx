import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import ClientsSatisfactionCard from "./components/clients-satisfaction-card";
import NewTicketsCard from "./components/new-tickets-card";
import PerformanceOfAgentsCard from "./components/performance-of-agents-card";
import RecentCustomerRatingCard from "./components/recent-customer-rating-card";
import ResponseTimeCard from "./components/response-time-card";
import SlaMonitoringCard from "./components/sla-monitoring-card";
import TicketStatCards from "./components/ticket-stat-cards";
import TicketsByChannelCard from "./components/tickets-by-channel-card";
import TicketsByTypeCard from "./components/tickets-by-type-card";
import TicketsSolvedCreatedCard from "./components/tickets-solved-created-card";

export const metadata: Metadata = {
  title: "Help Desk Dashboard | Admina Admin Dashboard",
  description:
    "Track tickets, SLA monitoring, agent performance, response times, and customer ratings with the Help Desk Dashboard in Admina.",
};

const HelpDeskPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Help Desk" text="Help Desk" />

      <div className="grid grid-cols-12 gap-5 mt-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <TicketStatCards />
        </Suspense>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <NewTicketsCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <ResponseTimeCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <ClientsSatisfactionCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <SlaMonitoringCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TicketsSolvedCreatedCard />
          </Suspense>
        </div>

        <div className="col-span-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <PerformanceOfAgentsCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <TicketsByChannelCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <TicketsByTypeCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <RecentCustomerRatingCard />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default HelpDeskPage;
