import { Bitcoin, RefreshCw } from "lucide-react";

const CryptoHeader = () => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 bg-white dark:bg-[#273142] flex items-center justify-center rounded-full text-primary shadow-md shrink-0">
          <Bitcoin className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-neutral-700 dark:text-white mb-1">Crypto Overview</h2>
          <span className="font-normal text-sm text-neutral-500 dark:text-neutral-400">
            Cryptocurrency is a digital currency that uses cryptography for secure transactions and operates independently of central banks.
          </span>
        </div>
      </div>
      <button type="button" className="text-white py-3 px-6 inline-flex items-center gap-1 bg-primary hover:bg-primary/90 rounded-full shrink-0">
        <RefreshCw className="w-5 h-5" />
        <span className="font-medium text-sm text-white">Refresh Data</span>
      </button>
    </div>
  );
};

export default CryptoHeader;
