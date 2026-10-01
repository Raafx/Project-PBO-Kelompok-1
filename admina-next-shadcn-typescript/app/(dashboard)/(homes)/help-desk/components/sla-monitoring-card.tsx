import CustomSelect from "@/components/shared/custom-select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowRight, ArrowUpDown, Monitor, Ticket } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

interface Sla {
  id: string;
  subject: string;
  iconClass: string;
  requester: string;
  due: string;
  remaining: string;
}

const rows: Sla[] = [
  { id: "#548", subject: "Issues with Email Access", iconClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500", requester: "demo@gmail.com", due: "Dec 10, 2026 12:00 PM", remaining: "1 days 4 hours" },
  { id: "#475", subject: "Software Installation", iconClass: "bg-sky-50 dark:bg-sky-600/10 text-sky-600 dark:text-sky-500", requester: "demo@gmail.com", due: "Dec 10, 2026 12:00 PM", remaining: "5 days 7 hours" },
  { id: "#748", subject: "Application Access Issue", iconClass: "bg-purple-50 dark:bg-purple-600/10 text-purple-600", requester: "demo@gmail.com", due: "Dec 10, 2026 12:00 PM", remaining: "15 days 2 hours" },
  { id: "#124", subject: "Network Connectivity", iconClass: "bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-500", requester: "demo@gmail.com", due: "Dec 10, 2026 12:00 PM", remaining: "1 days 4 hours" },
  { id: "#347", subject: "Issues with Email Access", iconClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500", requester: "demo@gmail.com", due: "Dec 10, 2026 12:00 PM", remaining: "7 days 4 hours" },
];

const columns = ["Ticket ID | Subject", "Requester | SLA Due By", "End Remaining", "Action"];

const SlaMonitoringCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <Monitor className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">SLA Monitoring</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">SLA Monitoring is essential for ensuring service quality.</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col} className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-left whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">{col}<ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${r.iconClass}`}>
                      <Ticket className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{r.id}</h2>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{r.subject}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-5">
                  <span className="block text-sm font-semibold text-neutral-900 dark:text-white leading-none mb-1">{r.requester}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{r.due}</span>
                </TableCell>
                <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{r.remaining}</TableCell>
                <TableCell className="py-3 px-5"><CardDropdown /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SlaMonitoringCard;
