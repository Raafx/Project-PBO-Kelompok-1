import { ArrowRight, RotateCcw, ShoppingBag, Star, Store, Truck, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface TimelineItemProps {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  time: string;
  description: string;
  last?: boolean;
  children?: ReactNode;
}

const TimelineItem = ({ icon: Icon, iconClass, title, time, description, last, children }: TimelineItemProps) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center shrink-0">
      <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      {!last && <div className="w-px grow bg-neutral-200 dark:bg-neutral-600 my-1" />}
    </div>
    <div className={`grow ${last ? "" : "pb-10"}`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">{title}</h2>
        <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal shrink-0">{time}</span>
      </div>
      <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-5">{description}</p>
      {children}
    </div>
  </div>
);

const StoreActivityTimelineCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] mb-6">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <Store className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Store Activity Timeline</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Monitor recent activity across your e-commerce store
            </span>
          </div>
        </div>
        <button type="button" className="shrink-0 flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-semibold">
          View All Activity <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div>
        <TimelineItem
          icon={ShoppingBag}
          iconClass="border-green-200 dark:border-green-600/20 bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500"
          title="New order placed"
          time="2 minutes ago"
          description="Order #ORD-2847 from Emma Wilson for $249.00"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex rounded-full border border-primary/20 text-primary px-3 py-1 font-medium text-xs">Wireless Headphones</span>
            <span className="inline-flex rounded-full border border-green-200 dark:border-green-600/20 text-green-600 px-3 py-1 font-medium text-xs dark:text-green-500">Payment Received</span>
          </div>
        </TimelineItem>

        <TimelineItem
          icon={RotateCcw}
          iconClass="border-red-200 dark:border-red-600/20 bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500"
          title="Refund requested"
          time="1 hour ago"
          description="Lisa Anderson requested refund for Order #ORD-2843"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" className="rounded-full bg-primary hover:bg-primary/90 text-white px-5 py-1 font-semibold text-sm">Approve</button>
            <button type="button" className="rounded-full border border-primary text-primary hover:bg-primary/10 px-5 py-1 font-semibold text-sm">Decline</button>
          </div>
        </TimelineItem>

        <TimelineItem
          icon={Star}
          iconClass="border-amber-200 dark:border-amber-600/20 bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-500"
          title="New review received"
          time="3 hours ago"
          description="Michael Chen left a 5-star review for Smart Watch Pro"
        >
          <div className="bg-sky-50 dark:bg-sky-600/10 border border-sky-100 dark:border-sky-600/20 rounded-lg px-4 py-2.5">
            <p className="text-sky-600 text-sm mb-0 italic dark:text-sky-500">
              &quot;Excellent product! Fast delivery and great quality. Highly recommend!&quot;
            </p>
          </div>
        </TimelineItem>

        <TimelineItem
          icon={User}
          iconClass="border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300"
          title="New customer registered"
          time="5 hours ago"
          description="Jessica Taylor created a new account and subscribed to newsletter"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex rounded-full border border-green-200 dark:border-green-600/20 text-green-600 px-4 py-2 font-medium text-xs dark:text-green-500">demo@gmail.com</span>
            <span className="inline-flex rounded-full border border-red-200 dark:border-red-600/20 text-red-600 px-4 py-2 font-medium text-xs dark:text-red-500">Newsletter Subscriber</span>
          </div>
        </TimelineItem>

        <TimelineItem
          icon={Truck}
          iconClass="border-sky-200 dark:border-sky-600/20 bg-sky-50 dark:bg-sky-600/10 text-sky-600 dark:text-sky-500"
          title="Order shipped"
          time="8 hours ago"
          description="Order #ORD-2846 has been shipped via FedEx Express"
          last
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex rounded-full border border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700 px-4 py-2 font-medium text-xs">
              Tracking: FDX-8472-9283-4721
            </span>
          </div>
        </TimelineItem>
      </div>
    </div>
  );
};

export default StoreActivityTimelineCard;
