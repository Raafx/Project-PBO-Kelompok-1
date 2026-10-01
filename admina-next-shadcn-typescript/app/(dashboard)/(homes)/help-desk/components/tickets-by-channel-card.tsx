import HelpdeskTicketsByChannelChart from "@/components/charts/helpdesk-tickets-by-channel-chart";
import { ClipboardList } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const legend = [
  { label: "Email", color: "bg-primary" },
  { label: "App", style: "#22c55e" },
  { label: "Web", style: "#f87171" },
  { label: "Chat", style: "#06b6d4" },
  { label: "Tab", style: "#facc15" },
];

const TicketsByChannelCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <ClipboardList className="text-green-600 dark:text-green-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Tickets by Channel</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Sales Channel Ticketing</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex justify-center">
        <HelpdeskTicketsByChannelChart />
      </div>

      <div className="flex items-center justify-center flex-wrap gap-4 mt-4">
        {legend.map((l, i) => (
          <div key={l.label} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${l.color ?? ""}`} style={l.style ? { background: l.style } : undefined} />
              <span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">{l.label}</span>
            </div>
            {i < legend.length - 1 && <span className="h-4 border-r border-neutral-200 dark:border-neutral-600" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketsByChannelCard;
