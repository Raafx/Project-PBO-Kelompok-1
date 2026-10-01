import HelpdeskNewTicketsChart from "@/components/charts/helpdesk-new-tickets-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Ticket } from "lucide-react";

const legend = [
  { label: "Low", color: "bg-primary" },
  { label: "Medium", color: "" , style: "#22c55e" },
  { label: "High", color: "", style: "#facc15" },
  { label: "Urgent", color: "", style: "#f87171" },
];

const NewTicketsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <Ticket className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">New Tickets Created</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">New Tickets Created for Your Immediate Review and Action</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <HelpdeskNewTicketsChart />

      <div className="flex items-center justify-center flex-wrap gap-5 mt-4">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${l.color}`} style={l.style ? { background: l.style } : undefined} />
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewTicketsCard;
