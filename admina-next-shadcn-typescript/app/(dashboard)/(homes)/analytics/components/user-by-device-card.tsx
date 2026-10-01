import AnalyticsUserByDeviceChart from "@/components/charts/analytics-user-by-device-chart";
import CustomSelect from "@/components/shared/custom-select";
import { MonitorSmartphone } from "lucide-react";

const UserByDeviceCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <MonitorSmartphone className="text-green-600 dark:text-green-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">User By Device</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Complete overview of all customer orders.</span>
          </div>
        </div>
        <CustomSelect placeholder="Last 7 month" options={["Last 7 month", "Last 3 month", "This Year"]} />
      </div>

      <AnalyticsUserByDeviceChart />

      <div className="flex items-center justify-center gap-6 mt-3 pt-4 border-t border-neutral-200 dark:border-neutral-600">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Desktop</span></div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Mobile</span></div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#f87171" }} /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Others</span></div>
      </div>
    </div>
  );
};

export default UserByDeviceCard;
