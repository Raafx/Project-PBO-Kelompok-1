import FinanceInvestmentChart from "@/components/charts/finance-investment-chart";
import CustomSelect from "@/components/shared/custom-select";
import { HandCoins } from "lucide-react";

const legend = [
  { label: "Net Income", color: "bg-primary" },
  { label: "Real Estate", style: "#06b6d4" },
  { label: "Business", style: "#f87171" },
];

const InvestmentCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <HandCoins className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Investment</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Investing builds wealth via stocks, bonds, or real estate.</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="relative w-[440px] max-w-full h-[360px] mx-auto my-3">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox="0 0 360 280" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="invArrowIndigo" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#6366f1" /></marker>
            <marker id="invArrowCoral" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f87171" /></marker>
            <marker id="invArrowCyan" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#06b6d4" /></marker>
          </defs>
          <polyline points="320,140 296,140" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#invArrowIndigo)" />
          <polyline points="62,78 88,64 96,70" fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#invArrowCoral)" />
          <polyline points="62,206 90,222 100,214" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#invArrowCyan)" />
        </svg>
        <div className="h-full flex justify-center items-center">
          <FinanceInvestmentChart />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-neutral-500 dark:text-neutral-400 text-sm block">Total Investment</span>
          <h2 className="text-3xl font-bold mb-0 text-neutral-900 dark:text-white">4.5K</h2>
        </div>
        <span className="absolute text-lg font-bold text-neutral-900 dark:text-white z-[3] right-0 top-1/2 -translate-y-1/2">45%</span>
        <span className="absolute text-lg font-bold text-neutral-900 dark:text-white z-[3] left-1 top-[56px]">25%</span>
        <span className="absolute text-lg font-bold text-neutral-900 dark:text-white z-[3] left-1 bottom-[56px]">30%</span>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-5 mt-3 pt-4 border-t border-neutral-200 dark:border-neutral-600">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${l.color ?? ""}`} style={l.style ? { background: l.style } : undefined} />
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentCard;
