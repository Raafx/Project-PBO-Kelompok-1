import { ChevronDown, Download, Share2, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SalesHeader = () => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 bg-white dark:bg-[#273142] flex items-center justify-center rounded-full text-primary shadow-md shrink-0">
          <Tag className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-neutral-700 dark:text-white mb-1">Hello there, Jack Miller</h2>
          <span className="font-normal text-sm text-neutral-500 dark:text-neutral-400">Welcome back, Let&apos;s make today a productive one!</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 shadow-md text-neutral-500 dark:text-neutral-300 rounded-full px-5 py-2.5 inline-flex items-center gap-2 text-sm font-medium outline-none">
            Filter By <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem className="cursor-pointer">Today</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">This Week</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button type="button" className="w-11 h-11 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center shrink-0">
          <Download className="w-5 h-5" />
        </button>
        <button type="button" className="w-11 h-11 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shrink-0">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SalesHeader;
