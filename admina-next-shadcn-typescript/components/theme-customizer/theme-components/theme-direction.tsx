"use client";

import { AlignEndVertical, AlignStartVertical } from "lucide-react";
import { useLocalStorageSetting } from "@/hooks/use-local-storage-setting";
import { useEffect } from "react";

const ThemeDirection = () => {
    // Persisted in localStorage and applied to <html dir="…">.
    const [direction, setDirection] = useLocalStorageSetting("direction", "ltr");

    useEffect(() => {
        document.documentElement.setAttribute("dir", direction);
    }, [direction]);

    const handleDirectionChange = (dir: "ltr" | "rtl") => {
        setDirection(dir);
    };

    return (
        <div className="theme-setting-item">
            <h6 className="font-medium text-base mb-3">Page Direction</h6>
            <div className="grid grid-cols-2 gap-4">
                {/* LTR */}
                <div
                    onClick={() => handleDirectionChange("ltr")}
                    className={`cursor-pointer border flex items-center justify-center gap-2 h-[60px] rounded-md ring-2 duration-300 ${direction === "ltr"
                        ? "ring-primary border-primary bg-primary/10"
                        : "ring-transparent border-neutral-300 dark:border-slate-500"
                        } hover:bg-primary/10`}
                >
                    <AlignStartVertical className={`${direction === "ltr" ? "text-primary" : ""}`} />
                    <h6 className={`text-sm font-medium text-neutral-500 dark:text-neutral-200 ${direction === "ltr" ? "text-primary dark:text-primary" : ""}`}>
                        LTR
                    </h6>
                </div>

                {/* RTL */}
                <div
                    onClick={() => handleDirectionChange("rtl")}
                    className={`cursor-pointer border flex items-center justify-center gap-2 h-[60px] rounded-md ring-2 duration-300 ${direction === "rtl"
                        ? "ring-primary border-primary bg-primary/10"
                        : "ring-transparent border-neutral-300 dark:border-slate-500"
                        } hover:bg-primary/10`}
                >
                    <h6 className={`text-sm font-medium text-neutral-500 dark:text-neutral-200 ${direction === "rtl" ? "text-primary" : ""}`}>
                        RTL
                    </h6>
                    <AlignEndVertical className={`${direction === "rtl" ? "text-primary" : ""}`} />
                </div>
            </div>
        </div>
    );
};

export default ThemeDirection;
