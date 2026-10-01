import CustomSelect from "@/components/shared/custom-select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Chrome, Compass, Flame, Globe } from "lucide-react";

interface Browser {
  name: string;
  company: string;
  icon: LucideIcon;
  iconColor: string;
  sessions: string;
  bounce: string;
}

const browsers: Browser[] = [
  { name: "Mozilla Firefox", company: "Mozilla,Inc", icon: Flame, iconColor: "text-orange-500", sessions: "4500", bounce: "4500" },
  { name: "Microsoft Edge", company: "Microsoft,Inc", icon: Globe, iconColor: "text-cyan-500", sessions: "7837", bounce: "7837" },
  { name: "Safari", company: "Assignee", icon: Compass, iconColor: "text-sky-500", sessions: "8371", bounce: "8371" },
  { name: "Google Chrome", company: "Google,Inc", icon: Chrome, iconColor: "text-green-500", sessions: "7403", bounce: "7403" },
  { name: "Opera Mini", company: "Opera,Inc", icon: Globe, iconColor: "text-red-500", sessions: "9183", bounce: "9183" },
  { name: "Safari", company: "Apple Corp,Inc", icon: Compass, iconColor: "text-sky-500", sessions: "9183", bounce: "9183" },
  { name: "Others", company: "Others,Inc", icon: Globe, iconColor: "text-neutral-400", sessions: "8397", bounce: "8397" },
];

const CryptoBrowserActivityCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-purple-100 dark:bg-purple-600/20 flex items-center justify-center rounded-full text-purple-600 shrink-0">
            <Globe className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Browser Activity</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Identify popular browsers</span>
          </div>
        </div>
        <CustomSelect placeholder="Weekly" options={["Weekly", "Monthly", "Yearly"]} />
      </div>

      <div className="overflow-x-auto grow">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              {["Browser", "Sessions", "Bounce Rate"].map((col) => (
                <TableHead key={col} className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 py-3 px-4 text-left whitespace-nowrap">{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {browsers.map((b, i) => {
              const Icon = b.icon;
              return (
                <TableRow key={i} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                  <TableCell className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-8 h-8 shrink-0 ${b.iconColor}`} />
                      <div>
                        <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{b.name}</h2>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{b.company}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-sm font-semibold text-neutral-900 dark:text-white whitespace-nowrap">{b.sessions}</TableCell>
                  <TableCell className="py-3.5 px-4 text-sm font-semibold text-neutral-900 dark:text-white whitespace-nowrap">{b.bounce}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 pt-4">
        <button type="button" className="text-primary hover:text-primary/80 font-semibold text-sm inline-flex items-center gap-2">
          See All Activity <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CryptoBrowserActivityCard;
