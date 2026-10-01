import SalesVisitorsDeviceChart from "@/components/charts/sales-visitors-device-chart";
import CustomSelect from "@/components/shared/custom-select";
import { MonitorSmartphone, TrendingDown, TrendingUp } from "lucide-react";

interface Device {
  name: string;
  color: string;
  change: string;
  up: boolean;
  count: string;
}

const devices: Device[] = [
  { name: "Desktop", color: "#22c55e", change: "48%", up: true, count: "50364" },
  { name: "Mobile", color: "#d946ef", change: "36.23%", up: false, count: "93457" },
  { name: "Laptop", color: "#06b6d4", change: "38.43%", up: true, count: "45904" },
  { name: "Tablet", color: "#0d9488", change: "83%", up: true, count: "43359" },
  { name: "Smart TV", color: "#facc15", change: "6%", up: false, count: "16627" },
  { name: "Smart Watch", color: "#f87171", change: "7%", up: true, count: "70443" },
];

const VisitorsByDeviceCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-600/10 border border-amber-200 dark:border-amber-600/20 rounded-full flex items-center justify-center shrink-0">
            <MonitorSmartphone className="text-amber-600 dark:text-amber-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Visitors By Device</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Device Usage Summary Overview</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly"]} />
      </div>

      <div className="relative">
        <SalesVisitorsDeviceChart />
        <div className="absolute left-1/2 bottom-3.5 -translate-x-1/2 w-full text-center pointer-events-none">
          <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1">Total Visitors</span>
          <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">65.59K</h2>
        </div>
      </div>

      <div className="flex flex-col mt-2 divide-y divide-neutral-100 dark:divide-neutral-700">
        {devices.map((d) => {
          const Icon = d.up ? TrendingUp : TrendingDown;
          return (
            <div key={d.name} className="flex items-center justify-between gap-2 py-3 px-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-neutral-900 dark:text-white text-sm font-medium">{d.name}</span>
              </div>
              <span className={`text-xs font-semibold inline-flex items-center gap-1 ${d.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                <Icon className="w-3 h-3" />{d.change}
              </span>
              <span className="text-neutral-900 dark:text-white text-sm font-bold text-right min-w-[56px]">{d.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisitorsByDeviceCard;
