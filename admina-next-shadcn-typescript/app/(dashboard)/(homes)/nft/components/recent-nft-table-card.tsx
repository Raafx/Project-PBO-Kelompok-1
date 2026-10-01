"use client";

import CryptoIcon from "@/app/(dashboard)/(homes)/ai-crypto-trading/components/crypto-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Creator1 from "@/public/assets/images/nft/creator-img1.png";
import Creator2 from "@/public/assets/images/nft/creator-img2.png";
import Creator3 from "@/public/assets/images/nft/creator-img3.png";
import Creator4 from "@/public/assets/images/nft/creator-img4.png";
import Creator5 from "@/public/assets/images/nft/creator-img5.png";
import Featured1 from "@/public/assets/images/nft/featured-creator1.png";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Leaf, MoreVertical } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import NftPeriodTabs from "./period-tabs";

interface NftRow {
  no: string;
  collection: string;
  category: string;
  avatar: StaticImageData;
  symbol: string;
  volume: string;
  price: string;
  change: number;
  items: string;
}

const rows: NftRow[] = [
  { no: "01", collection: "Moonbirds", category: "Artworks", avatar: Creator1, symbol: "BTC", volume: "21,457.02M", price: "$ 830.92", change: 22.15, items: "$ 802" },
  { no: "02", collection: "Doodles", category: "Games", avatar: Creator2, symbol: "ETH", volume: "54,142.27M", price: "$ 92.93", change: -3.25, items: "$ 830.92" },
  { no: "03", collection: "NFArcade Pass", category: "Photography", avatar: Creator3, symbol: "SOL", volume: "74,324.12M", price: "$ 74.03", change: 36.46, items: "$ 73.02" },
  { no: "04", collection: "Block Explorer", category: "Artworks", avatar: Creator4, symbol: "BNB", volume: "5,42,748.32M", price: "$ 4500", change: -3.25, items: "$ 45.99" },
  { no: "05", collection: "Moonbirds", category: "3d Style", avatar: Creator5, symbol: "ADA", volume: "73,786.14M", price: "$ 91.83", change: 37.41, items: "$ 91.83" },
  { no: "06", collection: "ByteGANs", category: "Crypto Card", avatar: Featured1, symbol: "XRP", volume: "6,54,954.31M", price: "$ 837.92", change: 55.45, items: "$ 74.03" },
];

const columns = ["S.No", "Collection", "24h Volume", "Creators", "24h Change", "Items", "Action"];

const RecentNftTableCard = () => {
  const [dense, setDense] = useState(false);
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);

  const sorted =
    sortAsc === null
      ? rows
      : [...rows].sort((a, b) => (sortAsc ? a.change - b.change : b.change - a.change));

  const cellPad = dense ? "py-2 px-5" : "py-4 px-5";

  return (
    <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 h-full">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-cyan-50 dark:bg-cyan-600/10 flex items-center justify-center rounded-full text-cyan-600 dark:text-cyan-500 shrink-0">
            <Leaf className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Recent Exclusive NFTs</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Explore the latest exclusive NFT collections today!</span>
          </div>
        </div>
        <NftPeriodTabs size="md" />
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              {columns.map((col) => {
                const isChange = col === "24h Change";
                return (
                  <TableHead key={col} className="text-neutral-500 dark:text-neutral-400 text-sm font-semibold py-4 px-5 text-left whitespace-nowrap">
                    {isChange ? (
                      <button
                        type="button"
                        onClick={() => setSortAsc((v) => (v === null ? true : !v))}
                        className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                      >
                        {col}
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        {col}
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r) => (
              <TableRow key={r.no} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className={`${cellPad} text-sm font-medium text-neutral-900 dark:text-white`}>{r.no}</TableCell>
                <TableCell className={cellPad}>
                  <div className="flex items-center gap-2.5">
                    <Image src={r.avatar} alt={r.collection} className="w-10 h-10 rounded-full shrink-0 object-cover" />
                    <div>
                      <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{r.collection}</h2>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{r.category}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={cellPad}>
                  <div className="flex items-center gap-2.5">
                    <CryptoIcon symbol={r.symbol} size={28} />
                    <div>
                      <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{r.volume}</h2>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">({r.symbol})</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={`${cellPad} text-sm font-medium text-neutral-900 dark:text-white`}>{r.price}</TableCell>
                <TableCell className={cellPad}>
                  <span className={`text-sm font-semibold inline-flex items-center gap-1 ${r.change >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                    {r.change >= 0 ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                    {r.change >= 0 ? "+" : ""}
                    {r.change}%
                  </span>
                </TableCell>
                <TableCell className={`${cellPad} text-sm font-medium text-neutral-900 dark:text-white`}>{r.items}</TableCell>
                <TableCell className={cellPad}>
                  <button type="button" aria-label="Row actions" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
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
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">1–06 of 1000</span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous page" className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Next page" className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentNftTableCard;
