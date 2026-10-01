import CustomSelect from "@/components/shared/custom-select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Layers } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";
import CryptoIcon from "./crypto-icon";

interface Holding {
  no: string;
  name: string;
  symbol: string;
  holdings: string;
  avgBuy: string;
  current: string;
  value: string;
  pnl: string;
}

const holdings: Holding[] = [
  { no: "01", name: "Bitcoin", symbol: "BTC", holdings: "2.54 BTC", avgBuy: "$ 830.92", current: "$ 783.83", value: "$ 802", pnl: "+56.94%" },
  { no: "02", name: "Ethereum", symbol: "ETH", holdings: "17.2 ETH", avgBuy: "$ 92.93", current: "$ 839", value: "$ 830.92", pnl: "+56.94%" },
  { no: "03", name: "Solana", symbol: "SOL", holdings: "175 SOL", avgBuy: "$ 74.03", current: "$ 74.03", value: "$ 73.02", pnl: "+56.94%" },
  { no: "04", name: "Binance Coin", symbol: "BNB", holdings: "32.8 BNB", avgBuy: "$ 4500", current: "$ 783.83", value: "$ 45.99", pnl: "+56.94%" },
  { no: "05", name: "Cardano", symbol: "ADA", holdings: "4850 ADA", avgBuy: "$ 91.83", current: "$ 839", value: "$ 91.83", pnl: "+56.94%" },
  { no: "06", name: "XRP", symbol: "XRP", holdings: "9200 XRP", avgBuy: "$ 837.92", current: "$ 802", value: "$ 74.03", pnl: "+56.94%" },
  { no: "07", name: "Polkadot", symbol: "DOT", holdings: "540 DOT", avgBuy: "$ 74.03", current: "$ 832", value: "$ 4500", pnl: "+56.94%" },
  { no: "08", name: "Avalanche", symbol: "AVAX", holdings: "73 AVAX", avgBuy: "$ 74.03", current: "$ 91.83", value: "$ 832", pnl: "+56.94%" },
];

const columns = ["S.No", "Asset", "Holdings", "Avg. Buy Price", "Current Price", "Value", "PnL", "Action"];

const PortfolioHoldingsCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px]">
      <div className="flex items-start justify-between gap-2 pb-5 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <Layers className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Portfolio Holdings</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Analyze visitors segmented by marketing channels</span>
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
            {holdings.map((h) => (
              <TableRow key={h.no} className="border-0 hover:bg-neutral-50 dark:hover:bg-slate-700">
                <TableCell className="py-3 px-5 text-sm font-semibold text-neutral-900 dark:text-white">{h.no}</TableCell>
                <TableCell className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <CryptoIcon symbol={h.symbol} size={36} />
                    <div>
                      <h2 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white">{h.name}</h2>
                      <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">({h.symbol})</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-5 text-sm text-neutral-900 dark:text-white font-medium">{h.holdings}</TableCell>
                <TableCell className="py-3 px-5 text-sm text-neutral-900 dark:text-white font-medium">{h.avgBuy}</TableCell>
                <TableCell className="py-3 px-5 text-sm text-neutral-900 dark:text-white font-medium">{h.current}</TableCell>
                <TableCell className="py-3 px-5 text-sm text-neutral-900 dark:text-white font-medium">{h.value}</TableCell>
                <TableCell className="py-3 px-5"><span className="text-green-600 dark:text-green-500 text-sm font-semibold">{h.pnl}</span></TableCell>
                <TableCell className="py-3 px-5"><CardDropdown /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PortfolioHoldingsCard;
