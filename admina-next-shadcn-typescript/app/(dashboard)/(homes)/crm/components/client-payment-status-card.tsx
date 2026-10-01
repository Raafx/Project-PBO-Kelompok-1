import CustomSelect from "@/components/shared/custom-select";
import { CreditCard } from "lucide-react";

const segments = [
  { color: "#06b6d4", width: "25%" },
  { color: "#22c55e", width: "45%" },
  { color: "#facc15", width: "15%" },
  { color: "#f87171", width: "15%" },
];

const rows = [
  { label: "Paid Payment", color: "#06b6d4", value: "$2,546" },
  { label: "Overdue Payment", color: "#22c55e", value: "$574,562" },
  { label: "Pending Payment", color: "#facc15", value: "$1,454" },
  { label: "Cancel Payment", color: "#f87171", value: "$1,454" },
];

const ClientPaymentStatusCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <CreditCard className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Client Payment Status</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Payment status update this week</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="flex mb-2">
        {segments.map((s, i) => (
          <span key={i} className="text-sm font-semibold text-neutral-600 dark:text-neutral-300" style={{ width: s.width }}>{s.width}</span>
        ))}
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden">
        {segments.map((s, i) => (
          <span key={i} style={{ width: s.width, background: s.color }} />
        ))}
      </div>

      <div className="mt-7">
        {rows.map((r, i) => (
          <div key={r.label} className={`flex items-center justify-between py-7 ${i === 0 ? "border-t border-b" : i < rows.length - 1 ? "border-b" : ""} border-neutral-200 dark:border-neutral-600`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{r.label}</span>
            </div>
            <span className="text-neutral-900 dark:text-white text-sm font-bold">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientPaymentStatusCard;
