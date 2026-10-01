import CustomSelect from "@/components/shared/custom-select";
import { ArrowRight, TrendingUp } from "lucide-react";

interface Source {
  name: string;
  percent: string;
  color: string;
}

const sources: Source[] = [
  { name: "Google", percent: "72.1%", color: "#4F46E5" },
  { name: "Twitter X", percent: "88.5%", color: "#22C55E" },
  { name: "Instagram", percent: "67.2%", color: "#00B8D9" },
  { name: "WhatsApp", percent: "49.4%", color: "#F6776E" },
  { name: "Linkedin", percent: "49.4%", color: "#F6776E" },
  { name: "Snapchat", percent: "67.2%", color: "#00B8D9" },
  { name: "Dribbble", percent: "88.5%", color: "#22C55E" },
  { name: "TikTok", percent: "72.1%", color: "#4F46E5" },
  { name: "Messenger", percent: "57.8%", color: "#FDC70F" },
  { name: "Slack", percent: "69.9%", color: "#00B8D9" },
  { name: "Meta", percent: "37.6%", color: "#4F46E5" },
  { name: "Behance", percent: "37.6%", color: "#4F46E5" },
  { name: "Telegram", percent: "69.9%", color: "#00B8D9" },
  { name: "Discord", percent: "57.8%", color: "#FDC70F" },
];

const TopTrafficSourcesCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="text-green-600 dark:text-green-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Top Traffic Sources</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Traffic overview by source type and performance</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sources.map((s, i) => (
          <div
            key={`${s.name}-${i}`}
            className="relative rounded-[10px] overflow-hidden h-12 flex items-center justify-between px-3.5"
            style={{ backgroundColor: `${s.color}14` }}
          >
            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: s.color }}
              >
                {s.name.charAt(0)}
              </span>
              <span className="text-neutral-900 dark:text-white font-medium text-sm">{s.name}</span>
            </div>
            <span className="text-neutral-900 dark:text-white font-semibold text-sm">{s.percent}</span>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All Sources <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TopTrafficSourcesCard;
