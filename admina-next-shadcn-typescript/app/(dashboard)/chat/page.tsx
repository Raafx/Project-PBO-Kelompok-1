"use client";

import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import { Suspense } from "react";
import ChatBox from "./components/chat-box";

const EmailPage = () => {
    return (
        <>
            <DashboardBreadcrumb title="Chat" text="Chat" />

            <Suspense fallback={<LoadingSkeleton />}>
                <ChatBox />
            </Suspense>

        </>
    );
};
export default EmailPage;