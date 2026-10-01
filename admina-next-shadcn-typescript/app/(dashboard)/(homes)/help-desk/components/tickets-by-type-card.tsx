import HelpdeskTicketsByTypeChart from "@/components/charts/helpdesk-tickets-by-type-chart";
import { Target } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const legend = [
  { label: "Technical Issue", color: "bg-primary" },
  { label: "General Inquiry", style: "#06b6d4" },
  { label: "Product Support", style: "#f87171" },
  { label: "Billing Inquiry", style: "#facc15" },
];

const TicketsByTypeCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <Target className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Tickets by Type</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Tickets categorized</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex justify-center">
        <HelpdeskTicketsByTypeChart />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-12">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${l.color ?? ""}`} style={l.style ? { background: l.style } : undefined} />
            <span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketsByTypeCard;
