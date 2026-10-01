import CustomSelect from "@/components/shared/custom-select";
import { Package } from "lucide-react";

interface DeliveryRow {
  label: string;
  value: string;
  color: string;
  width: string;
}

const rows: DeliveryRow[] = [
  { label: "On-Time Delivery", value: "1253", color: "#06b6d4", width: "25%" },
  { label: "Delivered", value: "859", color: "#22c55e", width: "45%" },
  { label: "In Transit", value: "320", color: "#facc15", width: "15%" },
  { label: "Delayed", value: "320", color: "#f87171", width: "15%" },
];

const DeliveryStatusCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
            <Package className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Delivery Status</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Delivery performance</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      {/* Segmented bar */}
      <div className="flex mb-2">
        {rows.map((row) => (
          <span
            key={row.label}
            className="text-sm font-semibold text-neutral-600 dark:text-neutral-300"
            style={{ width: row.width }}
          >
            {row.width}
          </span>
        ))}
      </div>
      <div className="flex h-2 rounded-full overflow-hidden">
        {rows.map((row) => (
          <span key={row.label} style={{ width: row.width, background: row.color }} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between py-4 ${
              i < rows.length - 1 ? "border-b border-neutral-200 dark:border-neutral-600" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{row.label}</span>
            </div>
            <span className="text-neutral-900 dark:text-white text-sm font-bold">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryStatusCard;
