import Flag1 from "@/public/assets/images/flags/flag1.png";
import Flag4 from "@/public/assets/images/flags/flag4.png";
import Flag5 from "@/public/assets/images/flags/flag5.png";
import Flag6 from "@/public/assets/images/flags/flag6.png";
import Flag7 from "@/public/assets/images/flags/flag7.png";
import { ArrowDown, ArrowRight, ArrowUp, Map } from "lucide-react";
import Image, { StaticImageData } from "next/image";

interface Location {
  name: string;
  flag: StaticImageData;
  percent: string;
  change: string;
  up: boolean;
  count: string;
}

const locations: Location[] = [
  { name: "United States", flag: Flag1, percent: "17.864%", change: "48%", up: true, count: "1,32,190" },
  { name: "Germany", flag: Flag4, percent: "16.984%", change: "36.23%", up: false, count: "5,86,486" },
  { name: "French", flag: Flag6, percent: "27.856%", change: "38.43%", up: true, count: "9,75,586" },
  { name: "Canada", flag: Flag5, percent: "12.957%", change: "83%", up: true, count: "4,32,767" },
  { name: "Spain", flag: Flag7, percent: "19.768%", change: "6%", up: false, count: "7,32,767" },
];

const TopAudienceLocationsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 p-6 rounded-2xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-green-100 dark:bg-green-600/20 flex items-center justify-center rounded-full text-green-600 dark:text-green-500 shrink-0">
            <Map className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Top Audience Locations</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Discover where your audience is located for better engagement strategies.</span>
          </div>
        </div>
        <button type="button" className="text-primary hover:text-primary/80 font-semibold text-sm inline-flex items-center gap-1 shrink-0">
          See More <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
        {locations.map((l) => {
          const Icon = l.up ? ArrowUp : ArrowDown;
          return (
            <div key={l.name} className="flex items-center gap-4 py-2.5 px-5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700">
              <div className="flex items-center gap-3 grow min-w-0">
                <Image src={l.flag} alt={l.name} className="w-8 h-6 rounded object-cover shrink-0" />
                <div>
                  <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{l.name}</h2>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{l.percent}</span>
                </div>
              </div>
              <span className={`text-sm font-semibold inline-flex items-center gap-1 w-24 ${l.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                <Icon className="w-3 h-3" />{l.change}
              </span>
              <span className="text-neutral-900 dark:text-white text-base font-bold text-right w-24">{l.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopAudienceLocationsCard;
