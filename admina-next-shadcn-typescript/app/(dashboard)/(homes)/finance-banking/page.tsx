import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import AuditReportCard from "./components/audit-report-card";
import EarningCategoriesCard from "./components/earning-categories-card";
import ExpenseBreakdownCard from "./components/expense-breakdown-card";
import IncomeExpenseStats from "./components/income-expense-stats";
import InvestmentCard from "./components/investment-card";
import LatestTransactionCard from "./components/latest-transaction-card";
import MarketingExpensesCard from "./components/marketing-expenses-card";
import ReceivablesPayableCard from "./components/receivables-payable-card";
import RevenueByDivisionCard from "./components/revenue-by-division-card";
import RevenueMarginCard from "./components/revenue-margin-card";
import TotalBalanceCard from "./components/total-balance-card";

export const metadata: Metadata = {
  title: "Finance & Banking Dashboard | Admina Admin Dashboard",
  description:
    "Monitor balance, income, expenses, revenue margins, marketing spend, receivables, investments, transactions, and audits with the Finance & Banking Dashboard in Admina.",
};

const FinanceBankingPage = () => {
  return (
    <>
      <DashboardBreadcrumb title="Finance & Banking" text="Finance & Banking" />

      <div className="grid grid-cols-12 gap-5 mt-6">
        <div className="col-span-12 lg:col-span-6 2xl:col-span-5">
          <Suspense fallback={<LoadingSkeleton />}>
            <TotalBalanceCard />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 2xl:col-span-7">
          <Suspense fallback={<LoadingSkeleton />}>
            <IncomeExpenseStats />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <RevenueMarginCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <MarketingExpensesCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <ExpenseBreakdownCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <EarningCategoriesCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <RevenueByDivisionCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-7">
          <Suspense fallback={<LoadingSkeleton />}>
            <LatestTransactionCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-5">
          <Suspense fallback={<LoadingSkeleton />}>
            <ReceivablesPayableCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-5">
          <Suspense fallback={<LoadingSkeleton />}>
            <InvestmentCard />
          </Suspense>
        </div>

        <div className="col-span-12 2xl:col-span-7">
          <Suspense fallback={<LoadingSkeleton />}>
            <AuditReportCard />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default FinanceBankingPage;
