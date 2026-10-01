import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import MarketplaceCard from "./components/marketplace-card";

export const metadata: Metadata = {
  title: "Marketplace | Admina Admin Dashboard",
  description:
    "Explore the marketplace dashboard in Admina. View products, listings, and performance insights with a clean and responsive UI built using Next.js, Tailwind CSS, and shadcn/ui.",
};

const MarketplacePage = () => {
    return (
        <>
            <DashboardBreadcrumb title="Marketplace" text="Marketplace" />

            <Suspense fallback={<LoadingSkeleton />}>
                <MarketplaceCard />
            </Suspense>

        </>
    );
};
export default MarketplacePage;