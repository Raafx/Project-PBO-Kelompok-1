import AnalyticsTopBrowsingPagesChart from "@/components/charts/analytics-top-browsing-pages-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

interface PageRow {
  page: string;
  views: string;
  bounce: string;
}

const rows: PageRow[] = [
  { page: "/dashboard-overview", views: "45", bounce: "83.4%" },
  { page: "/dashboard/products", views: "124", bounce: "90.6%" },
  { page: "/dashboard/users", views: "84", bounce: "45.8%" },
  { page: "/dashboard/performance", views: "36", bounce: "25.2%" },
];

const TopBrowsingPagesCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
            <Clock className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Top Browsing Pages Per Minute</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">See real-time page views across your site</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <AnalyticsTopBrowsingPagesChart />

      <div className="overflow-x-auto mt-5">
        <Table className="mb-0">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-neutral-500 dark:text-neutral-400 text-sm font-medium py-3 px-4 bg-neutral-50 dark:bg-neutral-700 rounded-s-lg text-left">Page</TableHead>
              <TableHead className="text-neutral-500 dark:text-neutral-400 text-sm font-medium py-3 px-4 bg-neutral-50 dark:bg-neutral-700 text-right">Views</TableHead>
              <TableHead className="text-neutral-500 dark:text-neutral-400 text-sm font-medium py-3 px-4 bg-neutral-50 dark:bg-neutral-700 text-right rounded-e-lg">Bounce Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.page} className="border-0 hover:bg-transparent">
                <TableCell className="py-3 px-4 text-sm text-neutral-900 dark:text-white">{r.page}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-neutral-900 dark:text-white text-right">{r.views}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-neutral-900 dark:text-white text-right">{r.bounce}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TopBrowsingPagesCard;
