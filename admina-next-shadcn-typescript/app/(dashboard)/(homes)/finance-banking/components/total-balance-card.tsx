import { PlusCircle, Send, TrendingUp, Wallet } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const TotalBalanceCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 text-purple-600 rounded-full flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </span>
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1">Total Balance</span>
            <h2 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">$24,580.00</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-600/10 text-green-600 px-3 py-1 font-semibold text-xs dark:text-green-500">
              <TrendingUp className="w-3.5 h-3.5" />+5.6% vs last month
            </span>
          </div>
        </div>
        <CardDropdown />
      </div>

      {/* Premium Card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden mb-6"
        style={{
          minHeight: 168,
          backgroundColor: "#0b1220",
          backgroundImage:
            "radial-gradient(70% 130% at 85% 25%, rgba(99,102,241,0.22), transparent 60%), radial-gradient(60% 120% at 65% 90%, rgba(56,189,248,0.12), transparent 70%)",
        }}
      >
        <div className="relative z-[1] flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <span className="text-white font-semibold">Premium Card</span>
            <span className="font-bold text-white">
              DISC<span style={{ color: "#f97316" }}>O</span>VER
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl text-white font-bold mb-2 tracking-[2px]">**** **** **** 4289</h2>
              <span className="text-white text-sm opacity-70">Exp : 12/28</span>
            </div>
            <div className="text-right">
              <span className="text-white text-sm block mb-1 opacity-70">Total Balance</span>
              <h2 className="text-xl text-white font-bold mb-0">$24,580.00</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Transfer */}
      <h2 className="text-base font-bold mb-3 text-neutral-900 dark:text-white">Quick Transfer</h2>
      <div className="flex items-center bg-neutral-50 dark:bg-neutral-700 rounded-full mb-3 p-[5px]">
        <select className="bg-white dark:bg-[#273142] rounded-full border-0 font-medium text-sm w-auto min-w-[64px] shrink-0 px-3 py-2 focus:ring-0 focus:outline-none text-neutral-900 dark:text-white">
          <option>Visa</option><option>Master</option><option>Paypal</option>
        </select>
        <input type="text" className="bg-transparent border-0 text-sm px-3 py-2.5 w-full focus:ring-0 focus:outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400" placeholder="Account Number..." />
      </div>
      <div className="flex items-center bg-neutral-50 dark:bg-neutral-700 rounded-full mb-5 p-[5px]">
        <select className="bg-white dark:bg-[#273142] rounded-full border-0 font-medium text-sm w-auto min-w-[64px] shrink-0 px-3 py-2 focus:ring-0 focus:outline-none text-neutral-900 dark:text-white">
          <option>$</option><option>€</option><option>£</option>
        </select>
        <input type="text" className="bg-transparent border-0 text-sm px-3 py-2.5 w-full focus:ring-0 focus:outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400" placeholder="Enter Amount..." />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button type="button" className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-3 grow inline-flex items-center justify-center gap-2 text-sm font-medium">
          <Send className="w-4 h-4" /> Send Money
        </button>
        <button type="button" className="border border-primary text-primary hover:bg-primary/10 rounded-full px-6 py-3 grow inline-flex items-center justify-center gap-2 text-sm font-medium">
          <PlusCircle className="w-4 h-4" /> Request
        </button>
      </div>
    </div>
  );
};

export default TotalBalanceCard;
