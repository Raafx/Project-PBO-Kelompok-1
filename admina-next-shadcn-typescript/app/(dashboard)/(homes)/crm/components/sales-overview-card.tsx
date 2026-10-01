import CrmSalesOverviewChart from "@/components/charts/crm-sales-overview-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Database, Handshake, Tag, TrendingDown, TrendingUp, Truck, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MiniStat {
  label: string;
  value: string;
  icon: LucideIcon;
  boxClass: string;
  iconColor: string;
  delta: string;
  deltaClass: string;
  up: boolean;
}

const miniStats: MiniStat[] = [
  { label: "Revenue", value: "$84.42k", icon: Wallet, boxClass: "bg-purple-50 dark:bg-purple-600/10 border-purple-100 dark:border-purple-600/20", iconColor: "text-purple-600", delta: "+45.4%", deltaClass: "text-red-600 dark:text-red-500", up: false },
  { label: "Orders", value: "7,245", icon: Truck, boxClass: "bg-green-50 dark:bg-green-600/10 border-green-100 dark:border-green-600/20", iconColor: "text-green-600 dark:text-green-500", delta: "92.9%", deltaClass: "text-green-600 dark:text-green-500", up: true },
  { label: "New Users", value: "74.25k", icon: Users, boxClass: "bg-sky-50 dark:bg-sky-600/10 border-sky-100 dark:border-sky-600/20", iconColor: "text-sky-600 dark:text-sky-500", delta: "-2,8%", deltaClass: "text-red-600 dark:text-red-500", up: false },
  { label: "New Contract", value: "851", icon: Handshake, boxClass: "bg-red-50 dark:bg-red-600/10 border-red-100 dark:border-red-600/20", iconColor: "text-red-600 dark:text-red-500", delta: "+66.1%", deltaClass: "text-green-600 dark:text-green-500", up: true },
];

const SalesOverviewCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <Tag className="text-green-600 dark:text-green-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Sales Overview</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Easily manage customer information and order updates while keeping sales records.
            </span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <div className="grid grid-cols-2 gap-2">
            {miniStats.map((s) => {
              const Icon = s.icon;
              const DeltaIcon = s.up ? TrendingUp : TrendingDown;
              return (
                <div key={s.label} className={`border rounded-xl p-5 h-full ${s.boxClass}`}>
                  <div className="flex items-center gap-4 mb-1">
                    <span className="w-[50px] h-[50px] bg-white dark:bg-[#273142] rounded-full flex items-center justify-center shrink-0">
                      <Icon className={`w-6 h-6 ${s.iconColor}`} />
                    </span>
                    <div>
                      <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{s.label}</span>
                      <h2 className="font-bold mb-1 text-lg text-neutral-900 dark:text-white">{s.value}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs flex-nowrap">
                    <span className={`font-semibold flex items-center gap-1 ${s.deltaClass}`}><DeltaIcon className="w-3.5 h-3.5" />{s.delta}</span>
                    <span className="text-neutral-500 dark:text-neutral-400">by this week!</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-xl p-4 mt-2">
            <Database className="text-amber-800 w-6 h-6 shrink-0" />
            <p className="mb-0 text-sm font-medium text-amber-700">
              We regret to inform you that our server is down.{" "}
              <button type="button" className="font-bold text-amber-800 underline">Refresh</button>
            </p>
          </div>
        </div>

        <div>
          <CrmSalesOverviewChart />
        </div>
      </div>
    </div>
  );
};

export default SalesOverviewCard;
