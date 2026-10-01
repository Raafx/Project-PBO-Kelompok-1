import Avatar1 from "@/public/assets/images/user-list/user-list1.png";
import Avatar2 from "@/public/assets/images/user-list/user-list2.png";
import Avatar3 from "@/public/assets/images/user-list/user-list3.png";
import Avatar4 from "@/public/assets/images/user-list/user-list4.png";
import Avatar5 from "@/public/assets/images/user-list/user-list5.png";
import { ArrowRight, TrendingUp } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import CardDropdown from "@/components/shared/card-dropdown";

interface Activity {
  name: string;
  detail: string;
  avatar: StaticImageData;
  amount: string;
  date: string;
}

const activities: Activity[] = [
  { name: "Jenny Wilson", detail: "To: 07 through 12 BB", avatar: Avatar1, amount: "2.5 BTC", date: "25 Jun, 2026" },
  { name: "Robert Fox", detail: "From: 01 up to 13 DD", avatar: Avatar2, amount: "10 ETH", date: "25 Jun, 2026" },
  { name: "Leslie Alexander", detail: "To: 03 through 09 VV", avatar: Avatar3, amount: "50 BNB", date: "25 Jun, 2026" },
  { name: "Jacob Jones", detail: "Between: 03 and 11 RR", avatar: Avatar4, amount: "500 ADA", date: "25 Jun, 2026" },
  { name: "Bessie Cooper", detail: "To: 09, through 16 PP", avatar: Avatar5, amount: "20 SOL", date: "25 Jun, 2026" },
];

const ActivitiesCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Activities</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Engaging in crypto trading.</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-700">
        {activities.map((a, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-3 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-700">
            <div className="flex items-center gap-2.5">
              <Image src={a.avatar} alt={a.name} className="w-9 h-9 rounded-full shrink-0 object-cover" />
              <div>
                <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{a.name}</h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{a.detail}</span>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{a.amount}</h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{a.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium w-fit">
          See All Activities <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ActivitiesCard;
