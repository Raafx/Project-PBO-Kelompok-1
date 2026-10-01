import AnalyticsSessionsOverviewChart from "@/components/charts/analytics-sessions-overview-chart";
import { ArrowDown, ArrowUp, ArrowUpDown, Clock, Download, Eye, Hourglass, TrendingUp, Upload, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tile {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  delta: string;
  deltaClass: string;
  deltaIcon: LucideIcon;
  border?: boolean;
  mdBorder?: boolean;
}

const tiles: Tile[] = [
  { label: "Users", value: "56,47k", icon: Users, iconColor: "text-primary", delta: "55.6%", deltaClass: "text-green-600 dark:text-green-500", deltaIcon: ArrowUpDown, border: true },
  { label: "Sessions", value: "75.74k", icon: Eye, iconColor: "text-green-600 dark:text-green-500", delta: "8.2%", deltaClass: "text-red-600 dark:text-red-500", deltaIcon: ArrowDown, mdBorder: true },
  { label: "Bounce Rate", value: "21,54%", icon: TrendingUp, iconColor: "text-amber-600 dark:text-amber-500", delta: "87.3%", deltaClass: "text-primary", deltaIcon: ArrowUp, border: true },
  { label: "Session Duration", value: "5m 12s", icon: Hourglass, iconColor: "text-red-600 dark:text-red-500", delta: "32.4%", deltaClass: "text-amber-600 dark:text-amber-500", deltaIcon: ArrowDown },
];

const SessionsOverviewCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-4 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <Clock className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">
              Sessions Overview <span className="text-neutral-500 dark:text-neutral-400 font-normal text-base">(609.5k Sessions)</span>
            </h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Analyze session performance to improve retention and growth.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-neutral-500 dark:text-neutral-300 font-medium text-sm">
            <Upload className="w-4 h-4" />Export
          </button>
          <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-100 dark:border-red-600/20 bg-red-50 dark:bg-red-600/10 text-neutral-500 dark:text-neutral-300 font-medium text-sm">
            <Download className="w-4 h-4" />Import
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl mb-6 overflow-hidden">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const DeltaIcon = tile.deltaIcon;
          return (
            <div
              key={tile.label}
              className={`p-5 ${tile.border ? "border-r border-neutral-200 dark:border-neutral-600" : ""} ${tile.mdBorder ? "md:border-r border-neutral-200 dark:border-neutral-600" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-[50px] h-[50px] bg-white dark:bg-[#273142] rounded-full flex items-center justify-center shrink-0">
                  <Icon className={`w-6 h-6 ${tile.iconColor}`} />
                </div>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">{tile.label}</span>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">{tile.value}</h2>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs ${tile.deltaClass}`}>
                      <DeltaIcon className="w-3 h-3" />
                      {tile.delta}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnalyticsSessionsOverviewChart />

      <div className="flex items-center justify-center gap-6 mt-3 pt-4 border-t border-neutral-200 dark:border-neutral-600">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Total Visitors</span></div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} /><span className="text-neutral-500 dark:text-neutral-400 text-sm">Page Views</span></div>
      </div>
    </div>
  );
};

export default SessionsOverviewCard;
