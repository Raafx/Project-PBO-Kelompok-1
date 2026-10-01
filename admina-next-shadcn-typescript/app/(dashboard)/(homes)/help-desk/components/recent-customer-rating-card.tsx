import CustomSelect from "@/components/shared/custom-select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Avatar1 from "@/public/assets/images/user-list/user-list1.png";
import Avatar2 from "@/public/assets/images/user-list/user-list2.png";
import Avatar3 from "@/public/assets/images/user-list/user-list3.png";
import Avatar4 from "@/public/assets/images/user-list/user-list4.png";
import Avatar5 from "@/public/assets/images/user-list/user-list5.png";
import { ArrowRight, ArrowUpDown, Send, Star } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import CardDropdown from "@/components/shared/card-dropdown";

interface Rating {
  id: string;
  name: string;
  avatar: StaticImageData;
  message: string;
}

const ratings: Rating[] = [
  { id: "#548", name: "Courtney Henry", avatar: Avatar1, message: "Overall good experience." },
  { id: "#548", name: "Savannah Nguyen", avatar: Avatar2, message: "Excellent experience!" },
  { id: "#548", name: "Brooklyn Simmons", avatar: Avatar3, message: "Top-notch customer service." },
  { id: "#548", name: "Esther Howard", avatar: Avatar4, message: "Overall good experience." },
  { id: "#548", name: "Ronald Richards", avatar: Avatar5, message: "Excellent experience overall." },
  { id: "#548", name: "Brooklyn Simmons", avatar: Avatar3, message: "Top-notch customer service." },
];

const columns = ["#ID", "Customer", "Rating", "Message", "Action"];

const RecentCustomerRatingCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-600/10 border border-sky-200 dark:border-sky-600/20 rounded-full flex items-center justify-center shrink-0">
            <Send className="text-sky-600 dark:text-sky-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Recent Customer Rating</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Recent Customer Rating: Your feedback helps us improve!</span>
          </div>
        </div>
        <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col} className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-left whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">{col}<ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ratings.map((r, i) => (
              <TableRow key={i} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{r.id}</TableCell>
                <TableCell className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <Image src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full shrink-0 object-cover" />
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{r.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-5">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-amber-500" />
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">4.8</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">(15)</span>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-5 text-sm font-medium text-neutral-500 dark:text-neutral-400">{r.message}</TableCell>
                <TableCell className="py-3 px-5"><CardDropdown /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RecentCustomerRatingCard;
