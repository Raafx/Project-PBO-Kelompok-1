import { ArrowRight, ShoppingBag } from "lucide-react";

interface SaleEvent {
  month: string;
  year: string;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  badgeClass: string;
}

const events: SaleEvent[] = [
  { month: "Nov, 24", year: "2025", title: "Black Friday Sale", subtitle: "Online & In-Store - All Customers", badge: "Up to 70% off", color: "text-green-600 dark:text-green-500", badgeClass: "bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500" },
  { month: "Dec, 20", year: "2025", title: "Holiday Blowout Sale", subtitle: "Online Exclusive - VIP Members", badge: "Flat 40% off", color: "text-red-600 dark:text-red-500", badgeClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500" },
  { month: "Jan, 10", year: "2026", title: "Summer Clearance", subtitle: "In-Store Only - All Customers", badge: "Up to 50% off", color: "text-amber-600 dark:text-amber-500", badgeClass: "bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-500" },
  { month: "Feb, 15", year: "2026", title: "Flash Electronics Sale", subtitle: "Online & In-Store - All Customers", badge: "Buy 1 Get 1 Free", color: "text-primary", badgeClass: "bg-primary/10 text-primary" },
  { month: "Mar, 25", year: "2026", title: "Tour Sale Discount", subtitle: "Online & In-Store - All Customers", badge: "Flat 40% off", color: "text-red-600 dark:text-red-500", badgeClass: "bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500" },
  { month: "May, 20", year: "2026", title: "Back to School Sale", subtitle: "Online Exclusive - All Customers", badge: "Up to 30% off", color: "text-cyan-600 dark:text-cyan-500", badgeClass: "bg-cyan-50 dark:bg-cyan-600/10 text-cyan-600 dark:text-cyan-500" },
  { month: "Feb, 15", year: "2026", title: "Flash Electronics Sale", subtitle: "Online & In-Store - All Customers", badge: "Buy 1 Get 1 Free", color: "text-primary", badgeClass: "bg-primary/10 text-primary" },
];

const UpcomingSalesCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 p-6 rounded-2xl h-full">
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-sky-100 dark:bg-sky-600/20 flex items-center justify-center rounded-full text-sky-600 dark:text-sky-500 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Upcoming Sales</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Sales are coming soon, don&apos;t miss!</span>
          </div>
        </div>
        <button type="button" className="text-primary hover:text-primary/80 font-semibold text-sm inline-flex items-center gap-1 shrink-0">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div>
        {events.map((e, i) => (
          <div key={i} className={`grid grid-cols-[60px_22px_1fr] gap-3 ${i < events.length - 1 ? "pb-10" : ""}`}>
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm block">{e.month}</span>
              <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">{e.year}</h2>
            </div>
            <div className={`relative flex justify-center ${i < events.length - 1 ? "after:content-[''] after:absolute after:top-[22px] after:left-1/2 after:-translate-x-1/2 after:w-0.5 after:bg-neutral-200 dark:after:bg-neutral-600 after:h-[calc(100%+38px)]" : ""}`}>
              <span className={`w-[18px] h-[18px] rounded-full border-4 border-current bg-white dark:bg-[#273142] mt-1 z-[1] ${e.color}`} />
            </div>
            <div>
              <h2 className="font-bold mb-1 text-base text-neutral-900 dark:text-white">{e.title}</h2>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm block mb-2">{e.subtitle}</span>
              <span className={`inline-flex rounded-full px-5 py-2.5 font-semibold text-xs ${e.badgeClass}`}>{e.badge}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingSalesCard;
