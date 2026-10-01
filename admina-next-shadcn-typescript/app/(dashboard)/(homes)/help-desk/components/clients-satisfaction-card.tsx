import HelpdeskClientsSatisfactionChart from "@/components/charts/helpdesk-clients-satisfaction-chart";
import { ThumbsUp } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const legend = [
  { label: "Highly Satisfied", color: "bg-primary" },
  { label: "Unsatisfied", style: "#06b6d4" },
  { label: "Satisfied", style: "#facc15" },
];

const ClientsSatisfactionCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <ThumbsUp className="text-green-600 dark:text-green-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Clients Satisfaction</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">People Happiness Ratings</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex justify-center">
        <HelpdeskClientsSatisfactionChart />
      </div>

      <div className="flex items-center justify-center flex-wrap gap-4 mt-4">
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

export default ClientsSatisfactionCard;
