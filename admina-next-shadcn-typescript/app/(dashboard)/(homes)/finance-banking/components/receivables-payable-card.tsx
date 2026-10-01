import FinanceReceivablesPayableChart from "@/components/charts/finance-receivables-payable-chart";
import CustomSelect from "@/components/shared/custom-select";
import { BarChart3 } from "lucide-react";

const ReceivablesPayableCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <BarChart3 className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Total Receivables vs Total Payable</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">An overview comparing receivables to payables.</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <FinanceReceivablesPayableChart />

      <div className="flex items-center justify-center flex-wrap gap-5 mt-3">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0 bg-primary" /><span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Payable</span></div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "#facc15" }} /><span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Receivables</span></div>
      </div>
    </div>
  );
};

export default ReceivablesPayableCard;
