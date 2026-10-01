"use client";

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface Cell {
  day: number;
  muted: boolean;
  today: boolean;
}

const events = [
  { color: "#8b5cf6", time: "08:30-10:30", title: "UI/UX Design SaaS Software Project Meeting", lead: "Darrell Steward" },
  { color: "#facc15", time: "08:30-10:30", title: "UI/UX Design SaaS Software Project Meeting", lead: "Darrell Steward" },
  { color: "#22c55e", time: "08:30-10:30", title: "UI/UX Design SaaS Software Project Meeting", lead: "Darrell Steward" },
  { color: "#f87171", time: "08:30-10:30", title: "UI/UX Design SaaS Software Project Meeting", lead: "Darrell Steward" },
  { color: "#8b5cf6", time: "08:30-10:30", title: "UI/UX Design SaaS Software Project Meeting", lead: "Darrell Steward" },
  { color: "#facc15", time: "08:30-10:30", title: "UI/UX Design SaaS Software Project Meeting", lead: "Darrell Steward" },
];

const WorkingScheduleCard = () => {
  // "Today" is only read in the browser so server and client markup match.
  const todayKey = useSyncExternalStore(subscribeNoop, () => new Date().toDateString(), () => null);
  const today = todayKey ? new Date(todayKey) : null;
  const [monthOffset, setMonthOffset] = useState(0);
  const view = today ? new Date(today.getFullYear(), today.getMonth() + monthOffset, 1) : null;

  const buildCells = (): Cell[] => {
    if (!view || !today) return [];
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const cells: Cell[] = [];
    for (let l = firstWeekday - 1; l >= 0; l--) cells.push({ day: daysInPrev - l, muted: true, today: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      cells.push({ day: d, muted: false, today: isToday });
    }
    let trailing = 1;
    while (cells.length % 7 !== 0) cells.push({ day: trailing++, muted: true, today: false });
    return cells;
  };

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const cells = buildCells();

  const shift = (delta: number) => setMonthOffset((offset) => offset + delta);

  return (
    <div className="bg-white dark:bg-[#273142] p-6 rounded-[20px] h-full">
      <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-purple-50 dark:bg-purple-600/10 text-purple-600 rounded-full flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">Working Schedule</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-xs font-normal">Project status updates.</span>
          </div>
        </div>
        <button type="button" className="bg-white dark:bg-[#273142] border border-primary text-primary hover:bg-primary/10 rounded-full px-4 py-2 text-sm font-medium">
          Add New Event
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-semibold text-neutral-900 dark:text-white text-base">
          {view ? `${MONTHS[view.getMonth()]} ${view.getFullYear()}` : ""}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300"><ChevronLeft className="w-4 h-4" /></button>
          <button type="button" onClick={() => shift(1)} aria-label="Next month" className="w-7 h-7 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center text-neutral-500 dark:text-neutral-300"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-5 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-1.5">{w}</span>
        ))}
        {cells.map((c, i) => (
          <span
            key={i}
            className={`text-xs py-1.5 rounded flex items-center justify-center ${
              c.today
                ? "bg-primary text-white font-semibold"
                : c.muted
                  ? "text-neutral-300 dark:text-neutral-600"
                  : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {pad(c.day)}
          </span>
        ))}
      </div>

      {events.map((e, i) => (
        <div key={i} className={`border-l-[3px] pl-3.5 ${i < events.length - 1 ? "mb-4" : ""}`} style={{ borderColor: e.color }}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-neutral-900 dark:text-white font-bold text-sm">{e.time}</span>
            <button type="button" className="text-primary text-xs font-medium">View Details →</button>
          </div>
          <h2 className="text-sm font-semibold mb-1 text-neutral-900 dark:text-white">{e.title}</h2>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Lead By <span className="text-primary font-medium">{e.lead}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default WorkingScheduleCard;
