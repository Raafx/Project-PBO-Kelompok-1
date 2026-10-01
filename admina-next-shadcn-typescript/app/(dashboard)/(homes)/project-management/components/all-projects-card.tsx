"use client";

import CustomSelect from "@/components/shared/custom-select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ChevronLeft, ChevronRight, PieChart } from "lucide-react";
import { useState } from "react";
import CardDropdown from "@/components/shared/card-dropdown";

type Status = "Cancelled" | "Completed" | "In Progress" | "Pending";

interface Project {
  id: string;
  name: string;
  client: string;
  start: string;
  end: string;
  budget: string;
  status: Status;
}

const statusClass: Record<Status, string> = {
  Cancelled: "border-red-200 dark:border-red-600/20 text-red-600 dark:text-red-500",
  Completed: "border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500",
  "In Progress": "border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500",
  Pending: "border-primary/20 text-primary",
};

const projects: Project[] = [
  { id: "#546", name: "Product development", client: "Vandhana Enterprises", start: "25 May 2026", end: "05 Dec 2026", budget: "$ 830.92", status: "Cancelled" },
  { id: "#435", name: "Python upgrade", client: "XYZ Enterprises", start: "25 May 2026", end: "05 Dec 2026", budget: "$ 783.83", status: "Completed" },
  { id: "#324", name: "Project alpho", client: "Shell Enterprises", start: "25 May 2026", end: "05 Dec 2026", budget: "$ 832", status: "Cancelled" },
  { id: "#456", name: "Hotel management system", client: "AR Traders", start: "25 May 2026", end: "05 Dec 2026", budget: "$ 45.99", status: "In Progress" },
  { id: "#213", name: "Product development", client: "Honda Enterprises", start: "25 May 2026", end: "05 Dec 2026", budget: "$ 837.92", status: "Pending" },
];

const columns = ["ID", "Project Name | Client", "Start Date", "End Date", "Budget", "Status", "Action"];

const AllProjectsCard = () => {
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(projects.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * rowsPerPage;
  const visible = projects.slice(start, start + rowsPerPage);
  const pad = dense ? "py-1.5 px-5" : "py-3 px-5";

  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <PieChart className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">All Projects</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Manage and collaborate on all your projects from start to finish in one place.</span>
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
            {visible.map((p) => (
              <TableRow key={p.id} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{p.id}</TableCell>
                <TableCell className={pad}>
                  <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{p.name}</h2>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{p.client}</span>
                </TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{p.start}</TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{p.end}</TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{p.budget}</TableCell>
                <TableCell className={pad}>
                  <span className={`inline-flex rounded-full border px-4 py-1.5 font-medium text-sm ${statusClass[p.status]}`}>{p.status}</span>
                </TableCell>
                <TableCell className={pad}><CardDropdown /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-600 flex-wrap">
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={dense} onChange={(e) => setDense(e.target.checked)} />
          <span className="block relative w-11 h-6 bg-neutral-200 dark:bg-neutral-600 rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">Dense</span>
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Rows per page:</span>
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }} className="w-auto border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300 rounded bg-white dark:bg-[#273142] text-sm py-1 px-2">
              <option value={5}>5</option><option value={25}>25</option><option value={50}>50</option>
            </select>
          </div>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">{projects.length === 0 ? 0 : start + 1}–{start + visible.length} of {projects.length}</span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous page" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0} className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <button type="button" aria-label="Next page" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={currentPage >= pageCount - 1} className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProjectsCard;
