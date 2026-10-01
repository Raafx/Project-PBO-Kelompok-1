"use client";

import { useState } from "react";

const periods = ["1W", "1M", "6M", "1Y", "ALL"];

interface PeriodTabsProps {
  /** Extra padding for the pill buttons (defaults to the compact size). */
  size?: "sm" | "md";
}

const NftPeriodTabs = ({ size = "sm" }: PeriodTabsProps) => {
  const [active, setActive] = useState("1M");
  const pad = size === "md" ? "px-4 py-1.5" : "px-3 py-1";

  return (
    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700 rounded-full p-1 shrink-0">
      {periods.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setActive(p)}
          className={`rounded-full text-sm font-medium transition ${pad} ${
            active === p ? "bg-primary text-white" : "text-neutral-500 dark:text-neutral-300"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default NftPeriodTabs;
