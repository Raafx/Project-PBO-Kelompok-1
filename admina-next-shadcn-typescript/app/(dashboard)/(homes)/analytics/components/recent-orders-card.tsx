"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Avatar1 from "@/public/assets/images/user-list/user-list1.png";
import Avatar10 from "@/public/assets/images/user-list/user-list10.png";
import Avatar2 from "@/public/assets/images/user-list/user-list2.png";
import Avatar3 from "@/public/assets/images/user-list/user-list3.png";
import Avatar4 from "@/public/assets/images/user-list/user-list4.png";
import Avatar5 from "@/public/assets/images/user-list/user-list5.png";
import Avatar6 from "@/public/assets/images/user-list/user-list6.png";
import Avatar7 from "@/public/assets/images/user-list/user-list7.png";
import Avatar8 from "@/public/assets/images/user-list/user-list8.png";
import Avatar9 from "@/public/assets/images/user-list/user-list9.png";
import { ArrowUpDown, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import CardDropdown from "@/components/shared/card-dropdown";

type OrderStatus = "Rejected" | "Confirmed" | "Pending" | "Shipped";

interface Order {
  id: string;
  invoice: string;
  customer: string;
  avatar: StaticImageData;
  date: string;
  time: string;
  total: string;
  profit: string;
  status: OrderStatus;
}

const statusClasses: Record<OrderStatus, string> = {
  Rejected: "text-red-600 border-red-200 dark:border-red-600/20 dark:text-red-500",
  Confirmed: "text-primary border-primary/30",
  Pending: "text-amber-600 border-amber-200 dark:border-amber-600/20 dark:text-amber-500",
  Shipped: "text-cyan-600 border-cyan-200 dark:border-cyan-600/20 dark:text-cyan-500",
};

const orders: Order[] = [
  { id: "o1", invoice: "INV-1005", customer: "Guy Hawkins", avatar: Avatar1, date: "22 Apr, 25", time: "06:42 am", total: "$ 4500", profit: "$ 839", status: "Rejected" },
  { id: "o2", invoice: "INV-1009", customer: "Jane Cooper", avatar: Avatar2, date: "12 Feb, 25", time: "07:38 am", total: "$ 783.83", profit: "$ 4500", status: "Confirmed" },
  { id: "o3", invoice: "INV-1010", customer: "Bessie Cooper", avatar: Avatar3, date: "07 Dec, 24", time: "01:34 pm", total: "$ 837.92", profit: "$ 837.92", status: "Rejected" },
  { id: "o4", invoice: "INV-1004", customer: "Jerome Bell", avatar: Avatar4, date: "22 Nov, 24", time: "01:55 pm", total: "$ 74.03", profit: "$ 783.83", status: "Pending" },
  { id: "o5", invoice: "INV-1007", customer: "Savannah Nguyen", avatar: Avatar5, date: "17 Sep, 24", time: "05:36 pm", total: "$ 91.83", profit: "$ 92.93", status: "Confirmed" },
  { id: "o6", invoice: "INV-1002", customer: "Theresa Webb", avatar: Avatar6, date: "13 Aug, 24", time: "04:02 am", total: "$ 839", profit: "$ 830.92", status: "Shipped" },
  { id: "o7", invoice: "INV-1006", customer: "Wade Warren", avatar: Avatar7, date: "13 Aug, 24", time: "04:02 am", total: "$ 73.02", profit: "$ 74.03", status: "Rejected" },
  { id: "o8", invoice: "INV-1006", customer: "Jacob Jones", avatar: Avatar8, date: "13 Aug, 24", time: "04:02 am", total: "$ 73.02", profit: "$ 74.03", status: "Confirmed" },
  { id: "o9", invoice: "INV-1006", customer: "Dianne Russell", avatar: Avatar9, date: "13 Aug, 24", time: "04:02 am", total: "$ 73.02", profit: "$ 74.03", status: "Pending" },
  { id: "o10", invoice: "INV-1006", customer: "Devon Lane", avatar: Avatar10, date: "13 Aug, 24", time: "04:02 am", total: "$ 73.02", profit: "$ 74.03", status: "Confirmed" },
  { id: "o11", invoice: "INV-1008", customer: "Annette Black", avatar: Avatar1, date: "01 Jun, 24", time: "02:02 am", total: "$ 802", profit: "$ 91.83", status: "Shipped" },
];

const columns = ["Order ID", "Customer", "Create", "Total", "Profit", "Status", "Action"];

const RecentOrdersCard = () => {
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(11);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(orders.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * rowsPerPage;
  const visible = orders.slice(start, start + rowsPerPage);
  const cellPad = dense ? "py-1.5 px-5" : "py-3 px-5";

  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0">
            <ShoppingCart className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold mb-0 text-lg text-neutral-900 dark:text-white">Recent Orders</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Latest customer orders with status, payment, and totals
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-left whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    {col} <ArrowUpDown className="w-3.5 h-3.5" />
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((order) => (
              <TableRow key={order.id} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className={`${cellPad} text-sm font-semibold text-neutral-900 dark:text-white`}>
                  {order.invoice}
                </TableCell>
                <TableCell className={cellPad}>
                  <div className="flex items-center gap-2">
                    <Image src={order.avatar} alt={order.customer} className="w-8 h-8 rounded-full shrink-0 object-cover" />
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{order.customer}</span>
                  </div>
                </TableCell>
                <TableCell className={cellPad}>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                    {order.date}
                    <br />
                    {order.time}
                  </span>
                </TableCell>
                <TableCell className={`${cellPad} text-sm text-neutral-900 dark:text-white font-medium`}>{order.total}</TableCell>
                <TableCell className={`${cellPad} text-sm text-neutral-900 dark:text-white font-medium`}>{order.profit}</TableCell>
                <TableCell className={cellPad}>
                  <span className={`inline-flex px-5 py-1.5 font-medium text-sm rounded-full border ${statusClasses[order.status]}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className={cellPad}>
                  <CardDropdown />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination / controls */}
      <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-600 flex-wrap">
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={dense} onChange={(e) => setDense(e.target.checked)} />
          <span className="block relative w-11 h-6 bg-neutral-200 dark:bg-neutral-600 rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full" />
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">Dense</span>
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              className="w-auto border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-300 rounded bg-white dark:bg-[#273142] text-sm py-1 px-2"
            >
              <option value={11}>11</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">
            {orders.length === 0 ? 0 : start + 1}–{start + visible.length} of {orders.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={currentPage >= pageCount - 1}
              className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentOrdersCard;
