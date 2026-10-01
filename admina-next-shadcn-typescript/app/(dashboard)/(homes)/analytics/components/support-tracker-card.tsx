import AnalyticsSupportTrackerChart from "@/components/charts/analytics-support-tracker-chart";
import CustomSelect from "@/components/shared/custom-select";
import { FolderOpen, ShieldCheck, Ticket, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Metric {
  value: string;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  border?: boolean;
}

const metrics: Metric[] = [
  { value: "1245", label: "New Tickets", icon: Ticket, iconClass: "bg-primary/10 border-primary/20 text-primary", border: true },
  { value: "2252", label: "Resolved Tickets", icon: ShieldCheck, iconClass: "bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500" },
  { value: "1547", label: "Open Tickets", icon: FolderOpen, iconClass: "bg-sky-50 dark:bg-sky-600/10 border-sky-200 dark:border-sky-600/20 text-sky-600 dark:text-sky-500", border: true },
  { value: "5m 12s", label: "Response Time", icon: Timer, iconClass: "bg-amber-100 dark:bg-amber-600/10 border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500" },
];

const SupportTrackerCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <Ticket className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Support Tracker</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Monitor ticket status and progress</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="relative z-[1]">
        <AnalyticsSupportTrackerChart />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] flex flex-col justify-center items-center bg-neutral-50 dark:bg-neutral-700 rounded-full">
          <h2 className="text-xl text-neutral-900 dark:text-white mb-1 font-semibold">5044</h2>
          <span className="text-neutral-500 dark:text-neutral-400 font-medium">Total Tickets</span>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-600 gap-y-10">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className={`flex items-center gap-3 ${m.border ? "pe-3 border-r border-neutral-200 dark:border-neutral-600" : "ps-3"}`}>
              <div className={`w-[50px] h-[50px] border rounded-full flex items-center justify-center shrink-0 ${m.iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">{m.value}</h2>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">{m.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupportTrackerCard;
