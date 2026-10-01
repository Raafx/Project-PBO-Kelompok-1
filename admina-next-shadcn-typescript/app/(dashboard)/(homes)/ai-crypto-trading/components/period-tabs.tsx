"use client";

import { useState } from "react";

const periods = ["1W", "1M", "6M", "1Y", "ALL"];

const PeriodTabs = () => {
  const [active, setActive] = useState("1M");

  return (
    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700 rounded-full p-1 shrink-0">
      {periods.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setActive(p)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            active === p ? "bg-primary text-white" : "text-neutral-500 dark:text-neutral-300"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export default PeriodTabs;
