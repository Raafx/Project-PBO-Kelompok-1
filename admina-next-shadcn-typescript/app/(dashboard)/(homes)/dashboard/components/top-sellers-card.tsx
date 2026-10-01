import CustomSelect from "@/components/shared/custom-select";
import Seller4 from "@/public/assets/images/user-list/user-list10.png";
import Seller5 from "@/public/assets/images/user-list/user-list5.png";
import Seller6 from "@/public/assets/images/user-list/user-list6.png";
import Seller1 from "@/public/assets/images/user-list/user-list7.png";
import Seller2 from "@/public/assets/images/user-list/user-list8.png";
import Seller3 from "@/public/assets/images/user-list/user-list9.png";
import { ArrowRight, BadgeCheck, Star, StarHalf, Users } from "lucide-react";
import Image, { StaticImageData } from "next/image";

interface Seller {
  id: number;
  name: string;
  image: StaticImageData;
  customerId: string;
}

const sellers: Seller[] = [
  { id: 1, name: "Robert Fox", image: Seller1, customerId: "#76431" },
  { id: 2, name: "Kristin Watson", image: Seller2, customerId: "#76431" },
  { id: 3, name: "Jacob Jones", image: Seller3, customerId: "#76431" },
  { id: 4, name: "Arlene McCoy", image: Seller4, customerId: "#76431" },
  { id: 5, name: "Darrell Steward", image: Seller5, customerId: "#76431" },
  { id: 6, name: "Courtney Henry", image: Seller6, customerId: "#76431" },
];

const Rating = () => (
  <div className="flex items-center gap-1 mb-1 text-amber-600 dark:text-amber-500">
    {[0, 1, 2, 3].map((i) => (
      <Star key={i} className="w-4 h-4 fill-current" />
    ))}
    <StarHalf className="w-4 h-4 fill-current" />
  </div>
);

const TopSellersCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <Users className="text-red-600 dark:text-red-500 w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Top Sellers</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Track best-selling items</span>
          </div>
        </div>
        <CustomSelect placeholder="Yearly" options={["Yearly", "Monthly", "Weekly", "Today"]} />
      </div>

      <div className="flex flex-col gap-1">
        {sellers.map((seller) => (
          <div
            key={seller.id}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-transparent hover:bg-neutral-100 dark:hover:bg-slate-700 hover:border-neutral-200 dark:hover:border-neutral-600 transition"
          >
            <div className="flex items-center">
              <Image src={seller.image} alt={seller.name} className="w-10 h-10 rounded-full shrink-0 me-3 overflow-hidden object-cover" />
              <div className="grow">
                <div className="flex items-center gap-1 text-base">
                  <h2 className="text-base mb-0 font-semibold text-neutral-900 dark:text-white">{seller.name}</h2>
                  <BadgeCheck className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Customer ID {seller.customerId}</span>
              </div>
            </div>
            <div>
              <Rating />
              <span className="text-neutral-500 dark:text-neutral-400 text-sm block text-right">Out of 5.00</span>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="flex items-center gap-2 text-primary hover:text-primary/80 text-base mt-3"
        >
          See All Sellers <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TopSellersCard;
