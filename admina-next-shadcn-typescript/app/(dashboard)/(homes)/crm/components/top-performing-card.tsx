"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import User1 from "@/public/assets/images/users/user1.png";
import User2 from "@/public/assets/images/users/user2.png";
import User3 from "@/public/assets/images/users/user3.png";
import User4 from "@/public/assets/images/users/user4.png";
import User5 from "@/public/assets/images/users/user5.png";
import { ArrowRight, ArrowUpDown, Rocket, Search } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import CardDropdown from "@/components/shared/card-dropdown";

interface Performer {
  id: string;
  name: string;
  role: string;
  avatar: StaticImageData;
  leads: string;
  deals: string;
  tasks: string;
}

const performers: Performer[] = [
  { id: "p1", name: "Fülöp Kata", role: "Project Manager", avatar: User1, leads: "703", deals: "453", tasks: "250" },
  { id: "p2", name: "Molnár Fruzsina", role: "Software Tester", avatar: User2, leads: "738", deals: "447", tasks: "291" },
  { id: "p3", name: "Nagy Tímea", role: "Ethical Hacker", avatar: User3, leads: "561", deals: "177", tasks: "384" },
  { id: "p4", name: "Dudás Nikolett", role: "President of Sales", avatar: User4, leads: "600", deals: "154", tasks: "446" },
  { id: "p5", name: "Kiss Laura", role: "UI/UX Designer", avatar: User5, leads: "994", deals: "196", tasks: "798" },
];

const TopPerformingCard = () => {
  const [query, setQuery] = useState("");
  const visible = performers.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 border border-green-200 dark:border-green-600/20 rounded-full flex items-center justify-center shrink-0">
            <Rocket className="text-green-600 dark:text-green-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Top Performing</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Identify top-performing items based on engagement.</span>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white rounded-full ps-5 pe-12 py-2.5 text-sm min-w-[220px] focus:outline-none"
            placeholder="Search"
          />
          <button type="button" className="w-8 h-8 bg-white dark:bg-[#273142] text-primary rounded-full flex items-center justify-center absolute top-1/2 end-0 -translate-y-1/2 me-1.5">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              {["User | Designation", "Leads | Deals", "Tasks"].map((col) => (
                <TableHead key={col} className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-left whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">{col}<ArrowUpDown className="w-3.5 h-3.5" /></span>
                </TableHead>
              ))}
              <TableHead className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-right whitespace-nowrap">
                <span className="inline-flex items-center gap-1">Action<ArrowUpDown className="w-3.5 h-3.5" /></span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((p) => (
              <TableRow key={p.id} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <Image src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full shrink-0 object-cover" />
                    <div>
                      <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{p.name}</h2>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{p.role}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-5">
                  <span className="block text-sm font-bold text-neutral-900 dark:text-white leading-none mb-1">{p.leads}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{p.deals}</span>
                </TableCell>
                <TableCell className="py-4 px-5 text-sm font-medium text-neutral-900 dark:text-white">{p.tasks}</TableCell>
                <TableCell className="py-4 px-5 text-right"><CardDropdown /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-5">
        <button type="button" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium">
          See All Performing <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TopPerformingCard;
