import CustomSelect from "@/components/shared/custom-select";
import { ArrowUpDown, CornerUpRight, Facebook, Mail, Megaphone, Package, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Channel {
  name: string;
  icon: LucideIcon;
  iconClass: string;
  amount: string;
  change: string;
  badgeClass: string;
  down?: boolean;
  bar: string;
  barColor: string;
}

const segments = [
  { pct: "25%", w: "25%", color: "bg-cyan-600" },
  { pct: "45%", w: "45%", color: "bg-green-600" },
  { pct: "15%", w: "15%", color: "bg-amber-600" },
  { pct: "5%", w: "5%", color: "bg-primary" },
  { pct: "15%", w: "15%", color: "bg-red-600" },
];

const channels: Channel[] = [
  { name: "Google Ads", icon: Megaphone, iconClass: "bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-500", amount: "$ 73.02", change: "3.5%", badgeClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500", bar: "62%", barColor: "bg-green-600" },
  { name: "Facebook Ads", icon: Facebook, iconClass: "bg-sky-100 dark:bg-sky-600/20 text-sky-600 dark:text-sky-500", amount: "$ 92.93", change: "4.2%", badgeClass: "bg-sky-50 dark:bg-sky-600/10 text-sky-600 dark:text-sky-500", bar: "55%", barColor: "bg-cyan-600" },
  { name: "Email Marketing", icon: Mail, iconClass: "bg-purple-100 dark:bg-purple-600/20 text-purple-600", amount: "$ 4500", change: "4.5%", badgeClass: "bg-primary/10 text-primary", bar: "70%", barColor: "bg-primary" },
  { name: "Referral Traffic", icon: Share2, iconClass: "bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-500", amount: "$ 837.92", change: "7.5%", badgeClass: "bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-500", bar: "50%", barColor: "bg-amber-600" },
  { name: "Direct Traffic", icon: CornerUpRight, iconClass: "bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-500", amount: "$ 475.12", change: "3.1%", badgeClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500", down: true, bar: "65%", barColor: "bg-primary" },
  { name: "Facebook Ads", icon: Facebook, iconClass: "bg-sky-100 dark:bg-sky-600/20 text-sky-600 dark:text-sky-500", amount: "$ 92.93", change: "4.2%", badgeClass: "bg-sky-50 dark:bg-sky-600/10 text-sky-600 dark:text-sky-500", bar: "55%", barColor: "bg-cyan-600" },
  { name: "Email Marketing", icon: Mail, iconClass: "bg-purple-100 dark:bg-purple-600/20 text-purple-600", amount: "$ 4500", change: "4.5%", badgeClass: "bg-primary/10 text-primary", bar: "70%", barColor: "bg-primary" },
];

const TopRevenueChannelsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-2xl h-full">
      <div className="flex items-center justify-between gap-2 mb-5 pb-5">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-purple-100 dark:bg-purple-600/20 flex items-center justify-center rounded-full text-purple-600 shrink-0">
            <Package className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Top Revenue Channels</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Primary Sources of Revenue</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="flex mb-2">
        {segments.map((s, i) => (
          <span key={i} className={`text-sm font-semibold text-neutral-900 dark:text-white ${i === segments.length - 1 ? "text-right" : ""}`} style={{ width: s.w }}>{s.pct}</span>
        ))}
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden">
        {segments.map((s, i) => (
          <span key={i} className={`h-full ${s.color}`} style={{ width: s.w }} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 mt-4 pb-4 mb-2 border-b border-neutral-200 dark:border-neutral-600">
        <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Overall Adds</span>
        <div className="flex items-center gap-2">
          <span className="text-green-600 dark:text-green-500 text-xs font-semibold inline-flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />3.5%</span>
          <h2 className="mb-0 font-bold text-base text-neutral-900 dark:text-white">2,25,957</h2>
        </div>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
        {channels.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="flex items-center gap-3 py-[15px]">
              <span className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 ${c.iconClass}`}>
                <Icon className="w-5 h-5" />
              </span>
              <div className="grow min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{c.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{c.amount}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-xs ${c.badgeClass}`}>
                      <ArrowUpDown className="w-3 h-3" />{c.change}
                    </span>
                  </div>
                </div>
                <div className="h-[5px] rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <span className={`block h-full rounded-full ${c.barColor}`} style={{ width: c.bar }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopRevenueChannelsCard;
