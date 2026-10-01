import CustomSelect from "@/components/shared/custom-select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ArrowUpDown, Chrome, Compass, Flame, Globe } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

interface Browser {
  no: string;
  name: string;
  icon: LucideIcon;
  iconColor: string;
  users: string;
  percent: number;
  barColor: string;
}

const browsers: Browser[] = [
  { no: "01", name: "Mozilla Firefox", icon: Flame, iconColor: "text-orange-500", users: "4500", percent: 80, barColor: "#6366f1" },
  { no: "02", name: "Microsoft Edge", icon: Globe, iconColor: "text-cyan-500", users: "7837", percent: 92, barColor: "#06b6d4" },
  { no: "03", name: "Safari", icon: Compass, iconColor: "text-sky-500", users: "8371", percent: 32, barColor: "#f87171" },
  { no: "04", name: "Google Chrome", icon: Chrome, iconColor: "text-green-500", users: "7403", percent: 76, barColor: "#22c55e" },
  { no: "05", name: "Opera Mini", icon: Globe, iconColor: "text-red-500", users: "9183", percent: 45, barColor: "#f59e0b" },
  { no: "06", name: "Others", icon: Globe, iconColor: "text-neutral-400", users: "8397", percent: 81, barColor: "#6366f1" },
];

const columns = ["No", "Browser", "Users", "Avg Used", "Action"];

const BrowserUsedCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
            <Globe className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Browser Used</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Identify popular browsers among your active users</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max text-center">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead key={col} className={`text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 whitespace-nowrap ${i === 1 || i === 3 ? "text-left" : "text-center"}`}>
                  <span className="inline-flex items-center gap-1">{col}<ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {browsers.map((b) => {
              const Icon = b.icon;
              return (
                <TableRow key={b.no} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                  <TableCell className="py-4 px-5 text-sm font-semibold text-neutral-900 dark:text-white text-center">{b.no}</TableCell>
                  <TableCell className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-6 h-6 shrink-0 ${b.iconColor}`} />
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{b.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-5 text-sm text-neutral-900 dark:text-white font-medium text-center">{b.users}</TableCell>
                  <TableCell className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{b.percent}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-600 overflow-hidden shrink-0">
                        <div className="h-full rounded-full" style={{ width: `${b.percent}%`, background: b.barColor }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-5 text-center">
                    <CardDropdown />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-5">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All Browsers <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BrowserUsedCard;
