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
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import CardDropdown from "@/components/shared/card-dropdown";

type Status = "Cancelled" | "Completed" | "In Progress";

interface Investment {
  serial: string;
  emoji: string;
  asset: string;
  subtitle: string;
  quantity: string;
  type: string;
  price: string;
  date: string;
  status: Status;
}

const statusClass: Record<Status, string> = {
  Cancelled: "border-red-200 dark:border-red-600/20 text-red-600 dark:text-red-500",
  Completed: "border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500",
  "In Progress": "border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500",
};

const investments: Investment[] = [
  { serial: "#01", emoji: "🪙", asset: "Gold", subtitle: "Main Asset", quantity: "536", type: "Ounces", price: "$ 830.92", date: "25 May 2026", status: "Cancelled" },
  { serial: "#02", emoji: "💵", asset: "Dollers", subtitle: "Currency", quantity: "130", type: "Dollars", price: "$ 783.83", date: "25 May 2026", status: "Completed" },
  { serial: "#03", emoji: "📈", asset: "Stock Market", subtitle: "Product", quantity: "703", type: "Products", price: "$ 832", date: "25 May 2026", status: "Cancelled" },
  { serial: "#04", emoji: "💎", asset: "Diamond", subtitle: "Asset", quantity: "647", type: "Ounces", price: "$ 45.99", date: "25 May 2026", status: "In Progress" },
  { serial: "#05", emoji: "📊", asset: "S&P 500", subtitle: "Index", quantity: "798", type: "Shares", price: "$ 837.92", date: "25 May 2026", status: "Completed" },
  { serial: "#06", emoji: "🏡", asset: "Real Estate", subtitle: "Construction", quantity: "429", type: "Shares", price: "$ 92.93", date: "25 May 2026", status: "In Progress" },
  { serial: "#07", emoji: "🛢️", asset: "Commodities", subtitle: "Oil, Silver, Gas", quantity: "447", type: "Ounces", price: "$ 73.02", date: "25 May 2026", status: "Completed" },
];

const columns = ["Serial No", "Asset", "Quantity", "Type", "Price", "Date", "Status", "Action"];

const LatestInvestmentCard = () => {
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(investments.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * rowsPerPage;
  const visible = investments.slice(start, start + rowsPerPage);
  const pad = dense ? "py-1.5 px-5" : "py-3 px-5";

  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-red-600 dark:text-red-500 text-2xl">📈</span>
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Latest Investment</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Discover the newest trends in investment opportunities that can help you grow your wealth effectively.
            </span>
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
            {visible.map((inv) => (
              <TableRow key={inv.serial} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{inv.serial}</TableCell>
                <TableCell className={pad}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{inv.emoji}</span>
                    <div>
                      <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{inv.asset}</h2>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{inv.subtitle}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{inv.quantity}</TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{inv.type}</TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{inv.price}</TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{inv.date}</TableCell>
                <TableCell className={pad}>
                  <span className={`inline-flex rounded-full border px-4 py-1.5 font-medium text-sm ${statusClass[inv.status]}`}>{inv.status}</span>
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
              <option value={7}>7</option><option value={25}>25</option><option value={50}>50</option>
            </select>
          </div>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">{investments.length === 0 ? 0 : start + 1}–{start + visible.length} of {investments.length}</span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous page" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0} className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <button type="button" aria-label="Next page" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={currentPage >= pageCount - 1} className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestInvestmentCard;
