import WorldMapChart from "@/components/charts/world-map-chart";
import CustomSelect from "@/components/shared/custom-select";
import Flag1 from "@/public/assets/images/flags/flag1.png";
import Flag2 from "@/public/assets/images/flags/flag2.png";
import Flag3 from "@/public/assets/images/flags/flag3.png";
import Flag4 from "@/public/assets/images/flags/flag4.png";
import { Globe } from "lucide-react";
import Image, { StaticImageData } from "next/image";

interface Country {
  name: string;
  flag: StaticImageData;
  sessions: string;
  percent: string;
  users: string;
}

const boxes: Country[][] = [
  [
    { name: "USA", flag: Flag1, sessions: "187,232", percent: "85%", users: "196,584" },
    { name: "China", flag: Flag2, sessions: "187,232", percent: "67%", users: "196,584" },
  ],
  [
    { name: "Australia", flag: Flag3, sessions: "187,232", percent: "74%", users: "196,584" },
    { name: "Germany", flag: Flag4, sessions: "187,232", percent: "63%", users: "196,584" },
  ],
];

const LocationBySessionCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <Globe className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Location By Session</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">See visitor distribution across countries</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-3 mb-4">
        <div className="h-[170px] flex items-center overflow-hidden">
          <WorldMapChart mapHeight={170} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {boxes.map((box, i) => (
          <div key={i} className="border border-neutral-200 dark:border-neutral-600 rounded-xl h-full overflow-hidden">
            <div className="flex items-center justify-between py-3 px-4 border-b border-neutral-200 dark:border-neutral-600 bg-amber-50 dark:bg-amber-600/10">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Country | Sessions</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Perc. | Users</span>
            </div>
            {box.map((c, j) => (
              <div key={c.name} className={`flex items-center justify-between py-3 px-4 ${j === 0 ? "border-b border-neutral-200 dark:border-neutral-600" : ""}`}>
                <div className="flex items-center gap-2">
                  <Image src={c.flag} alt={c.name} className="w-8 h-8 rounded object-cover shrink-0" />
                  <div>
                    <span className="block text-sm font-semibold text-neutral-900 dark:text-white leading-none mb-1">{c.name}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{c.sessions}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-semibold text-neutral-900 dark:text-white leading-none mb-1">{c.percent}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{c.users}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationBySessionCard;
