import CrmLeadSourceChart from "@/components/charts/crm-lead-source-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Link2 } from "lucide-react";

const legend = [
  { label: "Newsletter", color: "#6366f1" },
  { label: "Website", color: "#ef4444" },
  { label: "LinkedIn", color: "#06b6d4" },
  { label: "Instagram", color: "#d946ef" },
  { label: "WhatsApp", color: "#22c55e" },
  { label: "Telegram", color: "#facc15" },
];

const LeadSourceCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-full flex items-center justify-center shrink-0">
            <Link2 className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Lead Source</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Analyze lead sources for revenue.</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="relative">
        <CrmLeadSourceChart />
        <div className="absolute left-1/2 bottom-[14px] -translate-x-1/2 w-full text-center pointer-events-none">
          <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1">Total Products</span>
          <h2 className="text-2xl font-bold mb-0 text-neutral-900 dark:text-white">25.59K</h2>
        </div>
      </div>

      <div className="py-6 border-t border-b border-neutral-200 dark:border-neutral-600">
        <div className="grid grid-cols-3 gap-3">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadSourceCard;
