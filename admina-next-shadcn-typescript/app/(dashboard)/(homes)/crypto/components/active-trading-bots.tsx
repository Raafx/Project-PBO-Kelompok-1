import CryptoBotBarsChart from "@/components/charts/crypto-bot-bars-chart";
import { ArrowLeftRight, BarChart3, ChartPie, Rocket, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const cyan = "#22d3ee";
const indigo = "#6366f1";
const amber = "#facc15";
const green = "#22c55e";
const coral = "#f87171";

interface BotStat {
  label: string;
  value: string;
  valueClass?: string;
}

interface BotCard {
  name: string;
  pair: string;
  icon: LucideIcon;
  iconClass: string;
  stats: BotStat[];
  data: number[];
  colors: string[];
}

const bots: BotCard[] = [
  {
    name: "BTC Signal Bot",
    pair: "BTC/USDT",
    icon: BarChart3,
    iconClass: "bg-cyan-50 dark:bg-cyan-600/10 border-cyan-200 dark:border-cyan-600/20 text-cyan-600 dark:text-cyan-500",
    stats: [
      { label: "Today's PnL", value: "+$45,456.52", valueClass: "text-primary" },
      { label: "Win Rate", value: "72.4%" },
      { label: "Trades", value: "48" },
    ],
    data: [9, 11, 8, 13, 10, 15, 12, 20, 34, 46, 40, 26, 14, 10, 8, 7],
    colors: [cyan, cyan, cyan, cyan, cyan, cyan, cyan, indigo, indigo, indigo, indigo, indigo, cyan, cyan, cyan, cyan],
  },
  {
    name: "ETH DCA Bot",
    pair: "ETH/USDT",
    icon: ArrowLeftRight,
    iconClass: "bg-amber-50 dark:bg-amber-600/10 border-amber-200 dark:border-amber-600/20 text-amber-600 dark:text-amber-500",
    stats: [
      { label: "Today's PnL", value: "+$45,456.52", valueClass: "text-green-600 dark:text-green-500" },
      { label: "Avg Entry", value: "$5,745.74" },
      { label: "Orders", value: "12" },
    ],
    data: [18, 12, 22, 15, 25, 14, 20, 17, 23, 13, 19, 16, 24, 12, 21, 15],
    colors: [amber, green, amber, green, amber, green, amber, green, amber, green, amber, green, amber, green, amber, green],
  },
  {
    name: "Arbitrage Bot",
    pair: "Multi-Exchange",
    icon: Share2,
    iconClass: "bg-purple-50 dark:bg-purple-600/10 border-purple-100 dark:border-purple-600/20 text-purple-600",
    stats: [
      { label: "Today's PnL", value: "+$45,456.52", valueClass: "text-red-600 dark:text-red-500" },
      { label: "Opportunities", value: "115" },
      { label: "Executed", value: "96" },
    ],
    data: [7, 9, 8, 11, 10, 13, 12, 15, 14, 17, 19, 30, 42],
    colors: [green, green, green, green, green, green, green, green, green, green, green, indigo, indigo],
  },
  {
    name: "Pump Screener",
    pair: "Altcoins",
    icon: Rocket,
    iconClass: "bg-green-50 dark:bg-green-600/10 border-green-200 dark:border-green-600/20 text-green-600 dark:text-green-500",
    stats: [
      { label: "Today's PnL", value: "+$45,456.52", valueClass: "text-primary" },
      { label: "Alerts", value: "74" },
      { label: "Sniped", value: "16" },
    ],
    data: [16, 22, 14, 24, 18, 26, 15, 23, 17, 25, 19, 21, 16, 24, 20],
    colors: Array(15).fill(coral),
  },
];

const ActiveTradingBots = () => {
  return (
    <div className="mt-6 p-6 border border-neutral-200 dark:border-neutral-600 rounded-2xl">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-white dark:bg-[#273142] flex items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300 shrink-0">
            <ChartPie className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold text-neutral-700 dark:text-white mb-1 text-lg">Active Trading Bots</h2>
            <span className="font-normal text-sm text-neutral-500 dark:text-neutral-400">Real-time algorithmic trading performance</span>
          </div>
        </div>
        <button type="button" className="text-white py-3 px-6 inline-flex items-center gap-1 bg-primary hover:bg-primary/90 rounded-full shrink-0">
          <span className="font-medium text-sm text-white">View All Bot</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {bots.map((bot) => {
          const Icon = bot.icon;
          return (
            <div key={bot.name} className="col-span-12 sm:col-span-6 2xl:col-span-3">
              <div className="bg-white dark:bg-[#273142] rounded-2xl p-5 h-full shadow-[0_6px_18px_rgba(17,24,39,0.04)] hover:shadow-[0_10px_26px_rgba(17,24,39,0.08)] hover:-translate-y-0.5 transition">
                <div className="flex items-start justify-between gap-2 mb-5">
                  <div className="flex items-center gap-3">
                    <span className={`w-12 h-12 border rounded-xl flex items-center justify-center shrink-0 ${bot.iconClass}`}>
                      <Icon className="w-6 h-6" />
                    </span>
                    <div>
                      <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">{bot.name}</h2>
                      <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">{bot.pair}</span>
                    </div>
                  </div>
                  <span className="relative flex w-2.5 h-2.5 shrink-0 mt-2">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-green-600 opacity-60 animate-ping" />
                    <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-green-600" />
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {bot.stats.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-2">
                      <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">{s.label}</span>
                      <span className={`text-sm font-bold ${s.valueClass ?? "text-neutral-900 dark:text-white"}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
                <span className="block w-full h-0.5 bg-neutral-100 dark:bg-neutral-700 my-4" />
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1">Uptime</span>
                    <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">14d 8h 32m</h2>
                  </div>
                  <div className="w-[130px] shrink-0">
                    <CryptoBotBarsChart data={bot.data} colors={bot.colors} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveTradingBots;
