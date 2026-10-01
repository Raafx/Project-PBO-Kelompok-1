import PmProjectsProgressChart from "@/components/charts/pm-projects-progress-chart";
import CustomSelect from "@/components/shared/custom-select";
import { BarChart3 } from "lucide-react";

const legend = [
  { label: "In Progress", color: "#facc15", value: "48%" },
  { label: "Pending", color: "#06b6d4", value: "12%" },
  { label: "Completed", color: "#22c55e", value: "25%" },
  { label: "Cancelled", color: "#f87171", value: "15%" },
];

const ProjectsProgressCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <BarChart3 className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Projects Progress</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Monitoring project status.</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="relative flex justify-center my-3">
        <PmProjectsProgressChart />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center rounded-full bg-neutral-50 dark:bg-neutral-700 flex flex-col items-center justify-center w-[130px] h-[130px]">
          <h2 className="text-2xl font-bold mb-0 text-neutral-900 dark:text-white">4576</h2>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">Total Projects</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{l.label}</span>
            </div>
            <span className="text-neutral-900 dark:text-white text-sm font-semibold">{l.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsProgressCard;
