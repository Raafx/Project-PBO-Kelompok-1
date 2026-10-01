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
import Avatar6 from "@/public/assets/images/user-list/user-list6.png";
import Avatar7 from "@/public/assets/images/user-list/user-list7.png";
import { ArrowUpDown, BarChart3 } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import CardDropdown from "@/components/shared/card-dropdown";

interface Agent {
  id: string;
  name: string;
  avatar: StaticImageData;
  total: string;
  open: string;
  resolved: string;
  time: string;
  rate: number;
  barColor: string;
}

const agents: Agent[] = [
  { id: "#548", name: "Guy Hawkins", avatar: Avatar1, total: "536", open: "740", resolved: "883", time: "2h 58m", rate: 80, barColor: "primary" },
  { id: "#548", name: "Jane Cooper", avatar: Avatar2, total: "130", open: "154", resolved: "877", time: "3h 51m", rate: 92, barColor: "#06b6d4" },
  { id: "#548", name: "Bessie Cooper", avatar: Avatar3, total: "703", open: "826", resolved: "492", time: "1h 12m", rate: 32, barColor: "#f87171" },
  { id: "#548", name: "Jerome Bell", avatar: Avatar4, total: "647", open: "600", resolved: "540", time: "3h 15m", rate: 76, barColor: "#22c55e" },
  { id: "#548", name: "Savannah Nguyen", avatar: Avatar5, total: "798", open: "583", resolved: "423", time: "2h 40m", rate: 45, barColor: "#facc15" },
  { id: "#548", name: "Theresa Webb", avatar: Avatar6, total: "429", open: "274", resolved: "357", time: "2h 12m", rate: 81, barColor: "primary" },
  { id: "#548", name: "Wade Warren", avatar: Avatar7, total: "447", open: "177", resolved: "994", time: "1h 54m", rate: 45, barColor: "#facc15" },
];

const columns = ["Agent ID", "Agent", "Total Tickets", "Open Tickets", "Resolved Tickets", "Ave. Resolution Time", "Satisfaction Rate", "Action"];

const PerformanceOfAgentsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <BarChart3 className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Performance of Agents</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">The overall performance of agents is crucial for achieving success in our organization.</span>
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
            {agents.map((a, i) => (
              <TableRow key={i} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className="py-4 px-5 text-sm font-medium text-neutral-900 dark:text-white">{a.id}</TableCell>
                <TableCell className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <Image src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full shrink-0 object-cover" />
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{a.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-5 text-sm font-medium text-neutral-900 dark:text-white">{a.total}</TableCell>
                <TableCell className="py-4 px-5 text-sm font-medium text-neutral-900 dark:text-white">{a.open}</TableCell>
                <TableCell className="py-4 px-5 text-sm font-medium text-neutral-900 dark:text-white">{a.resolved}</TableCell>
                <TableCell className="py-4 px-5 text-sm font-medium text-neutral-900 dark:text-white">{a.time}</TableCell>
                <TableCell className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{a.rate}%</span>
                    <div className="w-16 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-600 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${a.barColor === "primary" ? "bg-primary" : ""}`}
                        style={{ width: `${a.rate}%`, background: a.barColor === "primary" ? undefined : a.barColor }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-5"><CardDropdown /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PerformanceOfAgentsCard;
