"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, LineChart, Search } from "lucide-react";
import { useState } from "react";

interface Trade {
  id: string;
  time: string;
  pair: string;
  type: "Stop" | "Limit" | "Market";
  side: "BUY" | "SELL";
  price: string;
  amount: string;
  total: string;
  pnl: string;
  pnlUp: boolean;
  bot: "Signal" | "DCA" | "Pump";
}

const typeClass: Record<Trade["type"], string> = {
  Stop: "border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300",
  Limit: "border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300",
  Market: "border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500",
};

const botClass: Record<Trade["bot"], string> = {
  Signal: "border-cyan-200 dark:border-cyan-600/20 text-cyan-600 dark:text-cyan-500",
  DCA: "border-primary/20 text-primary",
  Pump: "border-fuchsia-300 text-fuchsia-600",
};

const trades: Trade[] = [
  { id: "t1", time: "12:45:23", pair: "BTC/USDT", type: "Stop", side: "BUY", price: "$ 839", amount: "0.001161", total: "$ 74.03", pnl: "$1,000", pnlUp: true, bot: "Signal" },
  { id: "t2", time: "12:32:15", pair: "ETH/USDT", type: "Limit", side: "SELL", price: "$ 832", amount: "5.016000", total: "$ 92.93", pnl: "-$15,000", pnlUp: false, bot: "DCA" },
  { id: "t3", time: "12:18:42", pair: "SOL/USDT", type: "Stop", side: "BUY", price: "$ 783.83", amount: "2.357228", total: "$ 802", pnl: "$13,000", pnlUp: true, bot: "Pump" },
  { id: "t4", time: "11:55:08", pair: "LINK/USDT", type: "Market", side: "SELL", price: "$ 830.92", amount: "0.144400", total: "$ 837.92", pnl: "-$30,000", pnlUp: false, bot: "Signal" },
  { id: "t5", time: "11:42:33", pair: "AVAX/USDT", type: "Limit", side: "BUY", price: "$ 73.02", amount: "1.001161", total: "$ 45.99", pnl: "$12,000", pnlUp: true, bot: "DCA" },
];

const columns = ["Time", "Pair", "Type", "Side", "Price", "Amount", "Total", "PnL", "Bot"];

const RecentTradesCard = () => {
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = trades.filter((t) => t.pair.toLowerCase().includes(query.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * rowsPerPage;
  const visible = filtered.slice(start, start + rowsPerPage);
  const pad = dense ? "py-2 px-5" : "py-4 px-5";

  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
      <div className="flex items-start justify-between gap-4 flex-wrap pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <LineChart className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Trade History</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Analyze past trades to improve future strategy decisions</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              className="bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white rounded-full ps-5 pe-12 py-2.5 text-sm min-w-[240px] focus:outline-none"
              placeholder="Search"
            />
            <button type="button" className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center absolute top-1/2 end-0 -translate-y-1/2 me-1.5">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <button type="button" className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300 rounded-full px-5 py-2.5 inline-flex items-center gap-2 text-sm font-medium shrink-0">
            <Download className="text-primary w-4 h-4" />Import
          </button>
        </div>
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
            {visible.map((t) => (
              <TableRow key={t.id} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{t.time}</TableCell>
                <TableCell className={`${pad} text-sm font-semibold text-neutral-900 dark:text-white`}>{t.pair}</TableCell>
                <TableCell className={pad}>
                  <span className={`inline-flex rounded-full border px-4 py-1.5 font-medium text-sm ${typeClass[t.type]}`}>{t.type}</span>
                </TableCell>
                <TableCell className={pad}>
                  <span className={`font-bold text-sm ${t.side === "BUY" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{t.side}</span>
                </TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{t.price}</TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{t.amount}</TableCell>
                <TableCell className={`${pad} text-sm font-medium text-neutral-900 dark:text-white`}>{t.total}</TableCell>
                <TableCell className={`${pad} text-sm font-semibold ${t.pnlUp ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{t.pnl}</TableCell>
                <TableCell className={pad}>
                  <span className={`inline-flex rounded-full border px-4 py-1.5 font-medium text-sm ${botClass[t.bot]}`}>{t.bot}</span>
                </TableCell>
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
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
              className="w-auto border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300 rounded bg-white dark:bg-[#273142] text-sm py-1 px-2"
            >
              <option value={5}>05</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">
            {filtered.length === 0 ? 0 : start + 1}–{start + visible.length} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous page" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0} className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Next page" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={currentPage >= pageCount - 1} className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentTradesCard;
