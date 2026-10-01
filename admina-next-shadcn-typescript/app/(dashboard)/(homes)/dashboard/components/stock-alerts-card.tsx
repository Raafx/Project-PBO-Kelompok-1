import { AlertTriangle, ArrowRight } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

interface StockItem {
  name: string;
  tone: string;
}

const items: StockItem[] = [
  { name: "Tempered Glass Screen Protector", tone: "sky" },
  { name: "Wireless Charging Pad", tone: "red" },
  { name: "Noise Cancelling Earbuds", tone: "blue" },
  { name: "Wireless Mouse", tone: "green" },
  { name: "Fitness Tracker Band", tone: "amber" },
  { name: "LED Desk Lamp", tone: "cyan" },
  { name: "Bluetooth Speaker Mini", tone: "red" },
];

const toneMap: Record<string, string> = {
  sky: "bg-sky-50 dark:bg-sky-600/10 border-sky-100 dark:border-sky-600/20 text-sky-600 dark:text-sky-500",
  red: "bg-red-50 dark:bg-red-600/10 border-red-100 dark:border-red-600/20 text-red-600 dark:text-red-500",
  blue: "bg-primary/10 border-primary/20 text-primary",
  green: "bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500",
  amber: "bg-amber-50 dark:bg-amber-600/10 border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500",
  cyan: "bg-cyan-50 dark:bg-cyan-600/10 border-cyan-100 dark:border-cyan-600/20 text-cyan-600 dark:text-cyan-500",
};

const StockAlertsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] mb-6">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Stock Alerts</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Monitor inventory shortages before products go out.
            </span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex flex-col gap-3.5">
        {items.map((item, i) => {
          const tone = toneMap[item.tone];
          return (
            <div key={i} className={`flex items-center justify-between py-2.5 px-4 rounded-xl border ${tone}`}>
              <div className="flex flex-col">
                <p className="font-medium text-neutral-900 dark:text-white mb-2 text-lg">{item.name}</p>
                <span className="text-sm font-medium">Only 5 left</span>
              </div>
              <button type="button" className="font-semibold text-base">
                Restock
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-600">
        <button type="button" className="flex items-center gap-1 text-primary hover:text-primary/80 text-base font-medium">
          View All Stock <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StockAlertsCard;
