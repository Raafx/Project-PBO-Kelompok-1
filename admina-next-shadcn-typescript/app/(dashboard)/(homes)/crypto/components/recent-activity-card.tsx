import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowDownLeft, ArrowDownRight, ArrowLeftRight, ArrowRight, ArrowUpRight, Layers } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

interface Activity {
  title: string;
  subtitle: string;
  bot: string;
  time: string;
  amount: string;
  change: string;
  up: boolean;
  icon: LucideIcon;
  iconBg: string;
}

const activities: Activity[] = [
  { title: "BTC Sold", subtitle: "0.025 BTC @ $98,000", bot: "Signal Bot", time: "2 minutes ago", amount: "$ 839", change: "+4.42%", up: true, icon: ArrowDownRight, iconBg: "bg-amber-600" },
  { title: "ETH Bought", subtitle: "0.62 ETH @ $2,984", bot: "DCA Bot", time: "15 minutes ago", amount: "$ 91.83", change: "+3.41%", up: true, icon: ArrowDownLeft, iconBg: "bg-green-600" },
  { title: "Staking Reward", subtitle: "ETH Staking Pool", bot: "Auto-compound", time: "1 hour ago", amount: "$ 73.02", change: "-2.15%", up: false, icon: Layers, iconBg: "bg-purple-600" },
  { title: "Arbitrage Executed", subtitle: "BTC Binance → Coinbase", bot: "Arbitrage Bot", time: "2 hours ago", amount: "$ 45.99", change: "-7.74%", up: false, icon: ArrowLeftRight, iconBg: "bg-cyan-600" },
  { title: "Stop Loss Triggered", subtitle: "LINK/USDT Position Closed", bot: "Signal Bot", time: "3 hours ago", amount: "$ 832", change: "+10.72%", up: true, icon: AlertTriangle, iconBg: "bg-red-600" },
];

const RecentActivityCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] rounded-[20px] p-6 h-full">
      <div className="flex items-start justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <ArrowUpRight className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Recent Activity</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Track your latest trading activity</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex flex-col">
        {activities.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.title} className="grid grid-cols-[40px_1fr_auto] sm:grid-cols-[40px_minmax(0,1.35fr)_minmax(0,1fr)_auto] items-center gap-3 py-2.5 px-4 rounded-2xl border border-transparent hover:bg-neutral-100 dark:hover:bg-slate-700 transition">
              <span className={`w-10 h-10 rounded-full ${a.iconBg} text-white flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold mb-0 text-neutral-900 dark:text-white">{a.title}</h2>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">{a.subtitle}</span>
              </div>
              <div className="min-w-0 hidden sm:block">
                <h2 className="text-base font-medium mb-0 text-neutral-900 dark:text-white">{a.bot}</h2>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">{a.time}</span>
              </div>
              <div className="text-right">
                <h2 className="text-base font-bold mb-0 text-neutral-900 dark:text-white">{a.amount}</h2>
                <span className={`text-sm font-semibold ${a.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{a.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All Activity <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RecentActivityCard;
