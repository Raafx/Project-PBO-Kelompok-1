import AnalyticsAudienceOverviewChart from "@/components/charts/analytics-audience-overview-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Users } from "lucide-react";

const AudienceOverviewCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] grow">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-full flex items-center justify-center shrink-0">
            <Users className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Audience Overview</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Explore user engagement trends &amp; visitor retention over time.
            </span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year", "Today"]} />
      </div>
      <div className="-mt-4">
        <AnalyticsAudienceOverviewChart />
      </div>
    </div>
  );
};

export default AudienceOverviewCard;
