import { ArrowsUpFromLine, ArrowUpRight } from "lucide-react";
import CardDropdown from "@/components/shared/card-dropdown";

const CurrencyConverterCard = () => {
  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-start justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-600/10 border border-purple-100 dark:border-purple-600/20 rounded-full flex items-center justify-center shrink-0">
            <ArrowsUpFromLine className="text-purple-600 w-6 h-6 rotate-90" />
          </div>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Currency Converter</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Exchange Rate Tool Systems</span>
          </div>
        </div>
        <CardDropdown />
      </div>

      {/* Premium card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden mb-5 min-h-[168px]"
        style={{
          backgroundColor: "#0b1220",
          backgroundImage:
            "radial-gradient(70% 130% at 85% 25%, rgba(99,102,241,0.22), transparent 60%), radial-gradient(60% 120% at 65% 90%, rgba(56,189,248,0.12), transparent 70%)",
        }}
      >
        <div className="relative z-[1]">
          <span className="text-white text-sm block mb-1 opacity-70">Total Balance</span>
          <h2 className="text-white text-2xl font-bold mb-5">$24,580.00</h2>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-white text-base font-bold mb-1 tracking-[2px]">**** **** **** 4289</h2>
              <span className="text-white text-xs opacity-70">Exp : 12/28</span>
            </div>
            <span className="text-[15px] tracking-[0.5px] font-bold text-white">DISC<span style={{ color: "#f97316" }}>O</span>VER</span>
          </div>
        </div>
      </div>

      {/* Pay */}
      <div className="flex items-center bg-primary/10 rounded-full p-1 ps-3 mb-1">
        <span className="bg-white dark:bg-[#273142] text-primary rounded-full px-3 py-1.5 font-semibold text-xs shrink-0 ms-1.5">Pay</span>
        <input type="text" className="border-0 bg-transparent focus:outline-none text-sm w-full px-2 text-neutral-900 dark:text-white placeholder:text-neutral-400" placeholder="Enter Amount" />
        <select className="w-auto border-0 bg-white dark:bg-[#273142] rounded-full font-semibold text-sm shrink-0 me-2 py-1.5 ps-2 pe-6 text-neutral-900 dark:text-white"><option>BTC</option><option>ETH</option></select>
      </div>

      {/* Swap */}
      <div className="flex justify-center relative z-[2] -my-3">
        <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shrink-0 border-[3px] border-white dark:border-[#273142]">
          <ArrowsUpFromLine className="w-4 h-4" />
        </span>
      </div>

      {/* Buy */}
      <div className="flex items-center bg-primary/10 rounded-full p-1 ps-3 mt-1 mb-5">
        <span className="bg-white dark:bg-[#273142] text-primary rounded-full px-3 py-1.5 font-semibold text-xs shrink-0 ms-1.5">Buy</span>
        <input type="text" defaultValue="564,784.25" className="border-0 bg-transparent focus:outline-none text-sm w-full px-2 text-neutral-900 dark:text-white" />
        <select className="w-auto border-0 bg-white dark:bg-[#273142] rounded-full font-semibold text-sm shrink-0 me-2 py-1.5 ps-2 pe-6 text-neutral-900 dark:text-white"><option>USD</option><option>EUR</option></select>
      </div>

      {/* Fees */}
      <div className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3"><span className="text-neutral-500 dark:text-neutral-400 text-sm">Transaction Fee</span><span className="text-neutral-900 dark:text-white text-sm font-semibold">$5.65</span></div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-600"><span className="text-neutral-500 dark:text-neutral-400 text-sm">Other Charges</span><span className="text-neutral-900 dark:text-white text-sm font-semibold">$2.51</span></div>
        <div className="flex items-center justify-between"><span className="text-neutral-900 dark:text-white text-sm font-bold">Total</span><span className="text-neutral-900 dark:text-white text-sm font-bold">$8.14</span></div>
      </div>

      <button type="button" className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-3 w-full inline-flex items-center justify-center gap-2 text-sm font-medium">
        <span className="font-medium text-sm text-white">Convert Currency</span> <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CurrencyConverterCard;
