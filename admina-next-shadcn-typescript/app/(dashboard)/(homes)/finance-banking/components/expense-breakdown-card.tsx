import FinanceExpenseBreakdownChart from "@/components/charts/finance-expense-breakdown-chart";
import CustomSelect from "@/components/shared/custom-select";
import { PieChart } from "lucide-react";

const items = [
  { label: "Marketing", color: "#6366f1", width: "48%", value: "48%" },
  { label: "Rent", color: "#a5b4fc", width: "25%", value: "25%" },
  { label: "Software", color: "#6366f1", width: "12%", value: "12%" },
  { label: "Salaries", color: "#a5b4fc", width: "15%", value: "15%" },
];

const ExpenseBreakdownCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <PieChart className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Expense Breakdown</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Detailed Expense Breakdown for Clarity</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="relative flex justify-center my-3">
        <FinanceExpenseBreakdownChart />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center rounded-full bg-neutral-50 dark:bg-neutral-700 flex flex-col items-center justify-center p-5 w-[130px] h-[130px]">
          <h2 className="text-2xl font-bold mb-0 text-neutral-900 dark:text-white">9546</h2>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">Sources</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium grow">{item.label}</span>
            <div className="w-10 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: item.width, background: item.color }} />
            </div>
            <span className="text-neutral-900 dark:text-white text-sm font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseBreakdownCard;
