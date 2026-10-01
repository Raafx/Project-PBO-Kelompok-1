"use client";

import CryptoLineSpark from "@/components/charts/crypto-line-spark";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, TrendingDown, TrendingUp } from "lucide-react";
import CryptoIcon from "./crypto-icon";
import PeriodTabs from "./period-tabs";

interface Market {
  no: string;
  name: string;
  symbol: string;
  price: string;
  data: number[];
  graphColor: string;
  volume: string;
  change: string;
  up: boolean;
  marketCap: string;
}

const green = "#22c55e";
const red = "#ef4444";

const markets: Market[] = [
  { no: "01", name: "Bitcoin", symbol: "BTC", price: "$ 830.92", data: [12, 18, 14, 22, 17, 25, 20, 28], graphColor: green, volume: "21,457.02M", change: "+22.15%", up: true, marketCap: "$ 802" },
  { no: "02", name: "Ethereum", symbol: "ETH", price: "$ 92.93", data: [14, 12, 20, 16, 24, 18, 26, 22], graphColor: green, volume: "54,142.27M", change: "+14.27%", up: true, marketCap: "$ 830.92" },
  { no: "03", name: "Solana", symbol: "SOL", price: "$ 74.03", data: [26, 20, 24, 18, 22, 16, 20, 14], graphColor: red, volume: "74,324.12M", change: "+36.46%", up: true, marketCap: "$ 73.02" },
  { no: "04", name: "Binance Coin", symbol: "BNB", price: "$ 4500", data: [24, 22, 26, 18, 22, 16, 19, 15], graphColor: red, volume: "5,42,748.32M", change: "-3.29%", up: false, marketCap: "$ 45.99" },
  { no: "05", name: "Cardano", symbol: "ADA", price: "$ 91.83", data: [13, 19, 15, 23, 18, 26, 21, 28], graphColor: green, volume: "21,457.02M", change: "+37.41%", up: true, marketCap: "$ 91.83" },
  { no: "06", name: "XRP", symbol: "XRP", price: "$ 837.92", data: [12, 16, 14, 20, 18, 24, 22, 27], graphColor: green, volume: "54,142.27M", change: "+55.45%", up: true, marketCap: "$ 74.03" },
  { no: "07", name: "Polkadot", symbol: "DOT", price: "$ 74.03", data: [25, 21, 24, 19, 22, 17, 20, 16], graphColor: red, volume: "74,324.12M", change: "-7.64%", up: false, marketCap: "$ 4500" },
  { no: "08", name: "Avalanche", symbol: "AVAX", price: "$ 74.03", data: [14, 18, 15, 22, 19, 25, 21, 27], graphColor: green, volume: "5,42,748.32M", change: "-1.47%", up: false, marketCap: "$ 832" },
];

const columns = ["S No", "Asset", "Price", "Price Graph", "24h Volume", "24h Change", "Market Cap", "Action"];

const MarketOverviewCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/20 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="text-red-600 dark:text-red-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Crypto Currency Market Overview</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Explore the dynamic world of cryptocurrency and its market trends today.</span>
          </div>
        </div>
        <PeriodTabs />
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
            {markets.map((m) => {
              const Icon = m.up ? TrendingUp : TrendingDown;
              return (
                <TableRow key={m.no} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                  <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{m.no}</TableCell>
                  <TableCell className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <CryptoIcon symbol={m.symbol} size={32} />
                      <div>
                        <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{m.name}</h2>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">({m.symbol})</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{m.price}</TableCell>
                  <TableCell className="py-3 px-5">
                    <div className="w-[100px]">
                      <CryptoLineSpark data={m.data} color={m.graphColor} width={100} height={44} />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{m.volume}</TableCell>
                  <TableCell className="py-3 px-5">
                    <span className={`text-sm font-semibold inline-flex items-center gap-1 ${m.up ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                      <Icon className="w-3.5 h-3.5" />{m.change}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-5 text-sm font-medium text-neutral-900 dark:text-white">{m.marketCap}</TableCell>
                  <TableCell className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <button type="button" className="rounded-full bg-green-50 dark:bg-green-600/10 text-green-600 dark:text-green-500 px-4 py-1.5 font-medium text-sm">Buy</button>
                      <button type="button" className="rounded-full bg-red-50 dark:bg-red-600/10 text-red-600 dark:text-red-500 px-4 py-1.5 font-medium text-sm">Trade</button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MarketOverviewCard;
