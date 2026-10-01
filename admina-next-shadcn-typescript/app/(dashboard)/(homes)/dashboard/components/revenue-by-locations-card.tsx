import WorldMapChart from "@/components/charts/world-map-chart";
import CustomSelect from "@/components/shared/custom-select";
import Flag1 from "@/public/assets/images/flags/flag1.png";
import Flag2 from "@/public/assets/images/flags/flag2.png";
import Flag3 from "@/public/assets/images/flags/flag3.png";
import Flag4 from "@/public/assets/images/flags/flag4.png";
import Flag5 from "@/public/assets/images/flags/flag5.png";
import Flag6 from "@/public/assets/images/flags/flag6.png";
import Flag7 from "@/public/assets/images/flags/flag7.png";
import { ArrowRight, MoreVertical } from "lucide-react";
import Image, { StaticImageData } from "next/image";

interface Location {
  name: string;
  flag: StaticImageData;
  percent: string;
}

const locations: Location[] = [
  { name: "United States", flag: Flag1, percent: "85%" },
  { name: "China", flag: Flag2, percent: "67%" },
  { name: "Australia", flag: Flag3, percent: "74%" },
  { name: "Germany", flag: Flag4, percent: "63%" },
  { name: "Canada", flag: Flag5, percent: "81%" },
  { name: "France", flag: Flag6, percent: "75%" },
  { name: "Turkey", flag: Flag7, percent: "55%" },
];

const RevenueByLocationsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full flex flex-col">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <MoreVertical className="text-green-600 dark:text-green-500 w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Revenue By Locations</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Analyze revenue distribution across global locations
            </span>
          </div>
        </div>
        <MoreVertical className="text-neutral-400 w-6 h-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 grow">
        <div className="flex min-h-[280px] items-center">
          <WorldMapChart mapHeight={280} />
        </div>
        <div className="md:border-l md:border-neutral-200 dark:md:border-neutral-600 flex flex-col justify-between">
          {locations.map((loc) => (
            <div key={loc.name}>
              <span className="block w-full border-t border-neutral-200 dark:border-neutral-600" />
              <div className="flex items-center gap-3 justify-between flex-wrap py-2 px-4">
                <div className="flex items-center gap-3">
                  <Image src={loc.flag} alt={loc.name} className="w-6 h-6 object-contain" />
                  <span className="font-normal text-base text-neutral-700 dark:text-neutral-300">{loc.name}</span>
                </div>
                <span className="font-semibold text-base text-neutral-700 dark:text-neutral-200">{loc.percent}</span>
              </div>
            </div>
          ))}
          <span className="block w-full border-t border-neutral-200 dark:border-neutral-600" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 justify-between flex-wrap">
        <CustomSelect placeholder="Yearly" options={["Yearly", "Monthly", "Weekly", "Today"]} />
        <button type="button" className="flex items-center gap-2 text-primary hover:text-primary/80 text-base">
          View All Locations <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RevenueByLocationsCard;
