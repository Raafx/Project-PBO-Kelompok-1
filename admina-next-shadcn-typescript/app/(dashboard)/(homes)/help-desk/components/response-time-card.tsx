import HelpdeskResponseTimeChart from "@/components/charts/helpdesk-response-time-chart";
import { Timer } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const ResponseTimeCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-600/10 border border-cyan-200 dark:border-cyan-600/20 rounded-full flex items-center justify-center shrink-0">
            <Timer className="text-cyan-600 dark:text-cyan-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Response Time</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Average Response Time</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex items-start justify-between gap-2 mb-3 pt-5 mt-5 border-t border-neutral-100 dark:border-neutral-700">
        <div>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1 whitespace-nowrap">First Response Time</span>
          <h2 className="text-base font-bold mb-0 whitespace-nowrap text-neutral-900 dark:text-white">1h : 22m</h2>
        </div>
        <div>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1 whitespace-nowrap">Ave Resolution Time</span>
          <h2 className="text-base font-bold mb-0 whitespace-nowrap text-neutral-900 dark:text-white">10h : 42m</h2>
        </div>
      </div>

      <HelpdeskResponseTimeChart />

      <div className="flex items-center justify-center flex-wrap gap-4 mt-3 pt-4 border-t border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0 bg-primary" /><span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">First Response Time</span></div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#06b6d4" }} /><span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">Ave Resolution Time</span></div>
      </div>
    </div>
  );
};

export default ResponseTimeCard;
