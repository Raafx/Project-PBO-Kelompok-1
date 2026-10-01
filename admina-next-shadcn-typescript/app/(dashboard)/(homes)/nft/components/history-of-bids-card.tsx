import CustomSelect from "@/components/shared/custom-select";
import User1 from "@/public/assets/images/users/user1.png";
import User2 from "@/public/assets/images/users/user2.png";
import User3 from "@/public/assets/images/users/user3.png";
import User4 from "@/public/assets/images/users/user4.png";
import { ArrowRight, History } from "lucide-react";
import Image, { type StaticImageData } from "next/image";

interface BidRow {
  name: string;
  email: string;
  amount: string;
  avatar: StaticImageData;
}

const rows: BidRow[] = [
  { name: "Eleanor Pena", email: "info@demo.com", amount: "84.50 ETH", avatar: User1 },
  { name: "Guy Hawkins", email: "info@demo.com", amount: "456.75 ETH", avatar: User2 },
  { name: "Cody Fisher", email: "info@demo.com", amount: "2,450.00 ETH", avatar: User3 },
  { name: "Dianne Russell", email: "info@demo.com", amount: "415.00 ETH", avatar: User4 },
];

const HistoryOfBidsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-amber-100 dark:bg-amber-600/20 flex items-center justify-center rounded-full text-amber-600 dark:text-amber-500 shrink-0">
            <History className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">History of Bids</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Bids have evolved through time.</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="grow divide-y divide-neutral-100 dark:divide-neutral-700">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-700">
            <div className="flex items-center gap-3">
              <Image src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full shrink-0 object-cover" />
              <div>
                <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{r.name}</h2>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{r.email}</span>
              </div>
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">{r.amount}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4">
        <button type="button" className="text-primary hover:text-primary/80 font-semibold text-sm inline-flex items-center gap-2">
          See All Bids <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HistoryOfBidsCard;
