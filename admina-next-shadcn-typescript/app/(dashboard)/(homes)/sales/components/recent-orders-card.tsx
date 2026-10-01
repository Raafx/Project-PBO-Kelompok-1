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
import Product1 from "@/public/assets/images/user-list/user-list1.png";
import Product2 from "@/public/assets/images/user-list/user-list2.png";
import Product3 from "@/public/assets/images/user-list/user-list3.png";
import Product4 from "@/public/assets/images/user-list/user-list4.png";
import Product5 from "@/public/assets/images/user-list/user-list5.png";
import Product6 from "@/public/assets/images/user-list/user-list6.png";
import { MailOpen, MoreVertical, Search } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";

type Status = "Delivered" | "Cancelled" | "Pending" | "Shipped";

interface Order {
  serial: string;
  product: string;
  brand: string;
  image: StaticImageData;
  date: string;
  time: string;
  items: string;
  status: Status;
  amount: string;
  method: string;
  methodDetail: string;
}

const statusClass: Record<Status, string> = {
  Delivered: "border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500",
  Cancelled: "border-red-200 dark:border-red-600/20 text-red-600 dark:text-red-500",
  Pending: "border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500",
  Shipped: "border-primary/20 text-primary",
};

const orders: Order[] = [
  { serial: "#02", product: "Ladies Bag", brand: "Vellintn Brand", image: Product2, date: "2026-04-08", time: "11:26 AM", items: "5", status: "Delivered", amount: "$ 783.83", method: "Credit Card", methodDetail: "**** **** 1111" },
  { serial: "#03", product: "Flower Pot", brand: "Top Brand", image: Product3, date: "2026-04-08", time: "11:26 AM", items: "6", status: "Cancelled", amount: "$ 832", method: "MasterCard", methodDetail: "**** **** 4444" },
  { serial: "#04", product: "Wooden Sofa Set", brand: "Erat Brand", image: Product4, date: "2026-04-08", time: "11:26 AM", items: "9", status: "Pending", amount: "$ 45.99", method: "Bank Transfer", methodDetail: "Direct Payment" },
  { serial: "#05", product: "Lilly Soft Candles", brand: "Boalt Audio", image: Product5, date: "2026-04-08", time: "11:26 AM", items: "3", status: "Delivered", amount: "$ 837.92", method: "PayPal", methodDetail: "PayPal App" },
  { serial: "#06", product: "Apple AirPods Pro", brand: "Apple Brand", image: Product6, date: "2026-04-08", time: "11:26 AM", items: "7", status: "Shipped", amount: "$ 92.93", method: "Bank Transfer", methodDetail: "Direct Payment" },
  { serial: "#07", product: "Samsung Galaxy Watch", brand: "Electronics Brand", image: Product1, date: "2026-04-08", time: "11:26 AM", items: "2", status: "Delivered", amount: "$ 73.02", method: "PayPal", methodDetail: "PayPal App" },
];

const columns = ["Serial No", "Customer", "Ordered Date", "Total Items", "Status", "Total Amount", "Payment Method", "Action"];

const RecentOrdersCard = () => {
  const [query, setQuery] = useState("");
  const visible = orders.filter((o) => o.product.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 p-6 rounded-[20px]">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-xl flex items-center justify-center shrink-0">
            <MailOpen className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Recent Orders</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Here are your latest orders, ready for review and tracking at your convenience.</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto sm:shrink-0">
          <div className="relative grow sm:grow-0">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-neutral-100 dark:bg-neutral-700 border-0 rounded-full text-sm text-neutral-900 dark:text-white focus:outline-none py-2.5 w-full sm:min-w-[260px] ps-5 pe-12"
              placeholder="Search"
            />
            <button type="button" className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center absolute top-1/2 -translate-y-1/2 end-[5px]">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <CustomSelect placeholder="This Week" options={["This Week", "This Month", "This Year"]} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col} className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-left whitespace-nowrap">{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((o) => (
              <TableRow key={o.serial} className="border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{o.serial}</TableCell>
                <TableCell className="py-3 px-5">
                  <div className="flex items-center gap-2.5">
                    <Image src={o.image} alt={o.product} className="w-10 h-10 rounded-lg shrink-0 object-cover" />
                    <div>
                      <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{o.product}</h2>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{o.brand}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-5">
                  <h2 className="text-sm font-medium mb-0 text-neutral-900 dark:text-white">{o.date}</h2>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{o.time}</span>
                </TableCell>
                <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{o.items}</TableCell>
                <TableCell className="py-3 px-5">
                  <span className={`inline-flex rounded-full bg-white dark:bg-[#273142] border px-4 py-1.5 font-medium text-sm ${statusClass[o.status]}`}>{o.status}</span>
                </TableCell>
                <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{o.amount}</TableCell>
                <TableCell className="py-3 px-5">
                  <h2 className="text-sm font-medium mb-0 text-neutral-900 dark:text-white">{o.method}</h2>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{o.methodDetail}</span>
                </TableCell>
                <TableCell className="py-3 px-5">
                  <button type="button" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecentOrdersCard;
