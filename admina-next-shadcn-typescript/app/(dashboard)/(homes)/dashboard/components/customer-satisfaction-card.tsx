import CustomSelect from "@/components/shared/custom-select";
import { Smile, Star, StarHalf } from "lucide-react";

const bars = [
  { label: 5, width: "90%" },
  { label: 4, width: "75%" },
  { label: 3, width: "67%" },
  { label: 2, width: "44%" },
  { label: 1, width: "21%" },
];

const CustomerSatisfactionCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
            <Smile className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Customer Satisfaction</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Track ratings and feedback trends.</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="mb-8">
        <h2 className="text-4xl font-semibold mb-1 text-neutral-900 dark:text-white">
          4.9<span className="text-neutral-500 dark:text-neutral-400 text-xl font-normal">/5</span>
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 mb-1 text-amber-600 dark:text-amber-500">
            {[0, 1, 2, 3].map((i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <StarHalf className="w-4 h-4 fill-current" />
          </div>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">Based on 25,847 reviews</span>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-bold flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              {bar.label}
            </span>
            <div className="grow h-2 bg-neutral-200 dark:bg-neutral-700 rounded overflow-hidden">
              <div className="h-full bg-amber-600 rounded" style={{ width: bar.width }} />
            </div>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm min-w-[32px]">{bar.width}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerSatisfactionCard;
