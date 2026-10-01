import HelpdeskTicketsSolvedCreatedChart from "@/components/charts/helpdesk-tickets-solved-created-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Ticket } from "lucide-react";

const TicketsSolvedCreatedCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <Ticket className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Tickets Solved and Created</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Total Tickets Solved and Created This Month So Far Today</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <HelpdeskTicketsSolvedCreatedChart />

      <div className="flex items-center justify-center flex-wrap gap-5 mt-3">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "#facc15" }} /><span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Tickets Created</span></div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0 bg-primary" /><span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Tickets Solved</span></div>
      </div>
    </div>
  );
};

export default TicketsSolvedCreatedCard;
