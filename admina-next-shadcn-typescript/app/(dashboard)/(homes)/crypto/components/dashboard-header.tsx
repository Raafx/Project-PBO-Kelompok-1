import { LineChart, PlusCircle } from "lucide-react";

const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 bg-white dark:bg-[#273142] flex items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300">
          <LineChart className="w-5 h-5" />
        </span>
        <div>
          <h2 className="font-semibold text-neutral-700 dark:text-white mb-1 text-lg">Dashboard</h2>
          <span className="font-normal text-sm text-neutral-400">
            Welcome back, Robert! Here&apos;s your trading overview.
          </span>
        </div>
      </div>
      <button
        type="button"
        className="text-white py-3 px-6 inline-flex items-center gap-1 bg-primary hover:bg-primary/90 rounded-full shrink-0"
      >
        <PlusCircle className="w-5 h-5" />
        <span className="font-medium text-sm text-white">Add New Bot</span>
      </button>
    </div>
  );
};

export default DashboardHeader;
