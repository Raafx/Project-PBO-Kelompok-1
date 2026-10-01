import AnalyticsSubscribersChart from "@/components/charts/analytics-subscribers-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Sparkles, Users } from "lucide-react";

interface Channel {
  label: string;
  color: string;
  count: string;
  percent: string;
}

const channels: Channel[] = [
  { label: "Email Marketing", color: "#e0e7ff", count: "20.4K", percent: "42%" },
  { label: "Social Marketing", color: "#c7d2fe", count: "16.4K", percent: "28%" },
  { label: "Direct", color: "#a5b4fc", count: "8.4K", percent: "16%" },
  { label: "Referral", color: "#6366f1", count: "4.7K", percent: "8%" },
  { label: "Organic Search", color: "#4338ca", count: "3.1K", percent: "6%" },
];

const TotalSubscribersCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
            <Users className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Total Subscribers</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Subscriber count summary from your top acquisition channels.
            </span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year", "Today"]} />
      </div>

      <div className="-mt-6 w-full">
        <AnalyticsSubscribersChart />
      </div>

      <ul className="mt-7 flex flex-col gap-0">
        {channels.map((c, i) => (
          <li
            key={c.label}
            className={`flex items-center justify-between py-4 ${i < channels.length - 1 ? "border-b border-neutral-200 dark:border-neutral-600" : "py-3"}`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">{c.label}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-neutral-900 dark:text-white text-sm font-medium">{c.count}</span>
              <span className="text-neutral-900 dark:text-white text-sm font-medium">{c.percent}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-2 bg-primary/10 rounded-2xl p-4 mt-5">
        <div className="flex items-center gap-3">
          <div className="w-[50px] h-[50px] bg-white dark:bg-[#273142] rounded-full flex items-center justify-center shrink-0">
            <Sparkles className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-base text-neutral-900 dark:text-white">Congratulations !...</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">You&apos;ve reached a new subscriber milestone.</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">36.7K</h2>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Subscribers</span>
        </div>
      </div>
    </div>
  );
};

export default TotalSubscribersCard;
