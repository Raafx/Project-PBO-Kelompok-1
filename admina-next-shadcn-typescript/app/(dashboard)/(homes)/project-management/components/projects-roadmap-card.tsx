import PmRoadmapChart from "@/components/charts/pm-roadmap-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Target } from "lucide-react";

const ProjectsRoadmapCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <Target className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Projects Roadmap</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              A comprehensive overview of our upcoming projects and their timelines.
            </span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>
      <PmRoadmapChart />
    </div>
  );
};

export default ProjectsRoadmapCard;
