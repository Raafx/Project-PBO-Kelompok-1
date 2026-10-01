import CustomSelect from "@/components/shared/custom-select";
import Avatar1 from "@/public/assets/images/user-list/user-list1.png";
import Avatar2 from "@/public/assets/images/user-list/user-list2.png";
import Avatar3 from "@/public/assets/images/user-list/user-list3.png";
import Avatar4 from "@/public/assets/images/user-list/user-list4.png";
import Avatar5 from "@/public/assets/images/user-list/user-list5.png";
import Avatar6 from "@/public/assets/images/user-list/user-list6.png";
import { ArrowRight, Users } from "lucide-react";
import Image, { StaticImageData } from "next/image";

interface Customer {
  id: number;
  name: string;
  image: StaticImageData;
  purchases: number;
  amount: string;
}

const customers: Customer[] = [
  { id: 1, name: "Guy Hawkins", image: Avatar1, purchases: 15, amount: "$7,750" },
  { id: 2, name: "Cody Fisher", image: Avatar2, purchases: 18, amount: "$2,100" },
  { id: 3, name: "Theresa Webb", image: Avatar3, purchases: 24, amount: "$9,450" },
  { id: 4, name: "Ronald Richards", image: Avatar4, purchases: 27, amount: "$1,000" },
  { id: 5, name: "Arlene McCoy", image: Avatar5, purchases: 21, amount: "$2,700" },
  { id: 6, name: "Kristin Watson", image: Avatar6, purchases: 37, amount: "$7,000" },
];

const TopCustomersCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <Users className="text-green-600 dark:text-green-500 w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Top Customers</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Best customer growth</span>
          </div>
        </div>
        <CustomSelect placeholder="Yearly" options={["Yearly", "Monthly", "Weekly", "Today"]} />
      </div>

      <div className="flex flex-col gap-1">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-transparent hover:bg-neutral-100 dark:hover:bg-slate-700 hover:border-neutral-200 dark:hover:border-neutral-600 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg shrink-0 bg-sky-50 dark:bg-sky-600/10 flex justify-center items-center overflow-hidden">
                <Image src={customer.image} alt={customer.name} className="w-full h-full object-cover" />
              </div>
              <div className="grow">
                <h2 className="text-base mb-0 font-semibold text-neutral-900 dark:text-white">{customer.name}</h2>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 font-normal">{customer.purchases} Purchases</span>
              </div>
            </div>
            <span className="text-neutral-900 dark:text-white font-medium text-lg">{customer.amount}</span>
          </div>
        ))}

        <button
          type="button"
          className="flex items-center gap-2 text-primary hover:text-primary/80 text-base mt-3"
        >
          See All Customers <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TopCustomersCard;
