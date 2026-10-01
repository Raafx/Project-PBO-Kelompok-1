import CustomSelect from "@/components/shared/custom-select";
import User1 from "@/public/assets/images/users/user1.png";
import User2 from "@/public/assets/images/users/user2.png";
import User3 from "@/public/assets/images/users/user3.png";
import User4 from "@/public/assets/images/users/user4.png";
import User5 from "@/public/assets/images/users/user5.png";
import User6 from "@/public/assets/images/users/user6.png";
import { ArrowRight, Palette } from "lucide-react";
import Image, { type StaticImageData } from "next/image";

interface Artwork {
  name: string;
  sales: string;
  total: string;
  avatar: StaticImageData;
}

const artworks: Artwork[] = [
  { name: "Dimas Kamal", sales: "1099 Sales", total: "$ 92.93", avatar: User1 },
  { name: "Andra Mahmud", sales: "906 Sales", total: "$ 74.03", avatar: User2 },
  { name: "Giring Furqon", sales: "1840 Sales", total: "$ 830.92", avatar: User3 },
  { name: "Lukman Farhan", sales: "840 Sales", total: "$ 91.83", avatar: User4 },
  { name: "Farrel Kurniawan", sales: "731 Sales", total: "$ 45.99", avatar: User5 },
  { name: "Anika Islam", sales: "351 Sales", total: "$ 74.24", avatar: User6 },
  { name: "Hari Danang", sales: "612 Sales", total: "$ 4500", avatar: User1 },
];

const TopArtworksCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-red-50 dark:bg-red-600/10 flex items-center justify-center rounded-full text-red-600 dark:text-red-500 shrink-0">
            <Palette className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Top Artworks</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Explore stunning art pieces today.</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="grow divide-y divide-neutral-100 dark:divide-neutral-700">
        {artworks.map((a, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-700">
            <div className="flex items-center gap-3">
              <Image src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full shrink-0 object-cover" />
              <div>
                <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{a.name}</h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{a.sales}</span>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{a.total}</h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Total USD</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4">
        <button type="button" className="text-primary hover:text-primary/80 font-semibold text-sm inline-flex items-center gap-2">
          See All Artworks <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TopArtworksCard;
