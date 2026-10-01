"use client";

import { useState } from "react";

const periods = ["1W", "1M", "6M", "1Y", "ALL"];

const PeriodTabs = () => {
  const [active, setActive] = useState("1M");

  return (
    <div className="inline-flex items-center gap-1 border border-neutral-200 dark:border-neutral-600 rounded-full p-1 shrink-0">
      {periods.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setActive(p)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            active === p ? "bg-primary text-white" : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default PeriodTabs;
