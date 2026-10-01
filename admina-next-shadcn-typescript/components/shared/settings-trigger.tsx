import { Settings } from "lucide-react";
import Link from "next/link";

/** Bordered-circle gear button in the header (matches the reference navbar). */
const SettingsTrigger = () => {
  return (
    <Link
      href="/settings-notification"
      aria-label="Settings"
      className="inline-flex items-center justify-center rounded-full sm:w-10 sm:h-10 w-9 h-9 border border-gray-200 dark:border-slate-600 bg-white dark:bg-[#273142] text-neutral-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
    >
      <Settings className="h-[1.15rem] w-[1.15rem]" />
    </Link>
  );
};

export default SettingsTrigger;
