import HelpdeskTicketSparkline from "@/components/charts/helpdesk-ticket-sparkline";
import { TrendingDown, TrendingUp } from "lucide-react";

interface TicketStat {
  id: string;
  label: string;
  value: string;
  change: string;
  changeClass: string;
  up: boolean;
  data: number[];
  color?: string;
  markerIndex?: number;
}

const stats: TicketStat[] = [
  {
    id: "open",
    label: "Ticket Open",
    value: "2.75K",
    change: "80.2%",
    changeClass: "text-primary",
    up: true,
    data: [20, 36, 24, 46, 30, 50, 34, 40, 30, 52],
  },
  {
    id: "progress",
    label: "Tickets In Progress",
    value: "1.25K",
    change: "66.7%",
    changeClass: "text-sky-600 dark:text-sky-500",
    up: true,
    data: [46, 30, 50, 34, 48, 32, 44, 30, 42, 34],
    color: "#06b6d4",
  },
  {
    id: "resolved",
    label: "Tickets Resolved",
    value: "753",
    change: "17.3%",
    changeClass: "text-amber-600 dark:text-amber-500",
    up: false,
    data: [30, 38, 32, 55, 40, 34, 46, 32, 44, 34],
    color: "#eab308",
    markerIndex: 3,
  },
  {
    id: "closed",
    label: "Tickets Closed",
    value: "487",
    change: "11.4%",
    changeClass: "text-red-600 dark:text-red-500",
    up: false,
    data: [34, 26, 31, 23, 29, 25, 33, 28, 46, 56],
    color: "#ef4444",
  },
];

const TicketStatCards = () => {
  return (
    <>
      {stats.map((stat) => {
        const TrendIcon = stat.up ? TrendingUp : TrendingDown;
        return (
          <div key={stat.id} className="col-span-12 sm:col-span-6 2xl:col-span-3">
            <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
              <div className="flex items-center justify-between gap-3">
                <div className="shrink-0">
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium block mb-2">{stat.label}</span>
                  <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">{stat.value}</h2>
                  <div className="flex items-center gap-1 text-sm mt-6">
                    <span className={`font-semibold flex items-center gap-1 ${stat.changeClass}`}>
                      <TrendIcon className="w-4 h-4" />{stat.change}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400 font-normal">This Week</span>
                  </div>
                </div>
                <div className="grow max-w-[170px] relative after:content-[''] after:absolute after:top-1.5 after:bottom-1.5 after:right-0.5 after:border-r after:border-dashed after:border-neutral-300 dark:after:border-neutral-600">
                  <HelpdeskTicketSparkline data={stat.data} color={stat.color} markerIndex={stat.markerIndex} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default TicketStatCards;
