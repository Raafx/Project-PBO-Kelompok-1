import CrmCampaignsChart from "@/components/charts/crm-campaigns-chart";
import CustomSelect from "@/components/shared/custom-select";
import { ChartPie } from "lucide-react";

const items = [
  { label: "Email", color: "#6366f1", width: "48%", value: "48%" },
  { label: "Facebook", color: "#facc15", width: "48%", value: "25%" },
  { label: "Website", color: "#22c55e", width: "48%", value: "12%" },
  { label: "Others", color: "#06b6d4", width: "48%", value: "15%" },
];

const CampaignsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-600/10 border border-cyan-200 dark:border-cyan-600/20 rounded-full flex items-center justify-center shrink-0">
            <ChartPie className="text-cyan-600 dark:text-cyan-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Campaigns</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Monitor campaigns to improve results.</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="relative flex justify-center">
        <CrmCampaignsChart />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
          <h2 className="text-2xl font-bold mb-0 text-neutral-900 dark:text-white">9546</h2>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Total Campaigns</span>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-3 border-t border-neutral-100 dark:border-neutral-700">
        {items.map((item) => (
          <div key={item.label} className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{item.label}</span>
              <div className="w-16 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden ml-auto">
                <div className="h-full rounded-full" style={{ width: item.width, background: item.color }} />
              </div>
              <span className="text-neutral-900 dark:text-white text-sm font-bold">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignsCard;
