"use client";

import { LaptopMinimal, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

const LightDarkMode = () => {
    const { theme, setTheme } = useTheme();
    const isMounted = useMounted();

    // The theme is only known in the browser — render after mount to avoid a hydration mismatch.
    if (!isMounted) return null;

    return (
        <div className="theme-setting-item">
            <h6 className="font-medium text-base mb-3">Theme Mode</h6>
            <div className="grid grid-cols-3 gap-4">
                <div className="">
                    <div
                        className={`cursor-pointer border border-neutral-300 flex items-center justify-center hover:bg-primary/10 duration-300 h-[68px] rounded-md ring-2 dark:border-slate-500 ${theme === "light" ? "ring-primary text-primary dark:text-primary" : "ring-transparent text-neutral-500 dark:text-white"}`}
                        onClick={() => setTheme("light")}
                    >
                        <Sun />
                    </div>
                    <h6
                        className={`text-center text-sm font-medium pt-2 cursor-pointer hover:text-blue-500 ${theme === "light" ? "text-primary dark:text-primary" : "text-neutral-500 dark:text-neutral-200"}`}
                        onClick={() => setTheme("light")}
                    >Light</h6>
                </div>
                <div className="">
                    <div
                        className={`cursor-pointer border border-neutral-300 flex items-center justify-center hover:bg-primary/10 duration-300 h-[68px] rounded-md ring-2 dark:border-slate-500 ${theme === "dark" ? "ring-primary text-primary dark:text-primary" : "ring-transparent text-neutral-500 dark:text-white"}`}
                        onClick={() => setTheme("dark")}
                    >
                        <Moon />
                    </div>
                    <h6
                        className={`text-center text-sm font-medium pt-2 cursor-pointer hover:text-blue-500 ${theme === "dark" ? "text-primary dark:text-primary" : "text-neutral-500 dark:text-neutral-200"}`}
                        onClick={() => setTheme("dark")}
                    >Dark</h6>
                </div>
                <div className="">
                    <div
                        className={`cursor-pointer border border-neutral-300 flex items-center justify-center hover:bg-primary/10 duration-300 h-[68px] rounded-md ring-2 dark:border-slate-500 ${theme === "system" ? "ring-primary text-primary dark:text-primary" : "ring-transparent text-neutral-500 dark:text-white"}`}
                        onClick={() => setTheme("system")}
                    >
                        <LaptopMinimal />
                    </div>
                    <h6
                        className={`text-center text-sm font-medium pt-2 cursor-pointer hover:text-blue-500 ${theme === "system" ? "text-primary dark:text-primary" : "text-neutral-500 dark:text-neutral-200"}`}
                        onClick={() => setTheme("system")}
                    >System</h6>
                </div>

            </div>
        </div>
    );
};

export default LightDarkMode;