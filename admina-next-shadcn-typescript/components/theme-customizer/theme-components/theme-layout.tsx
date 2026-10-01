import { useLocalStorageSetting } from "@/hooks/use-local-storage-setting";
import { useEffect } from "react";
import { BoronIcon } from "../svg-icons/boron-icon";
import { HeliumIcon } from "../svg-icons/helium-icon";
import { HydrogenIcon } from "../svg-icons/hydrogen-icon";

const layouts = [
    {
        text: "hydrogen",
        icon: <HydrogenIcon />,
    },
    {
        text: "helium",
        icon: <HeliumIcon />,
    },
    {
        text: "boron",
        icon: <BoronIcon />,
    },
];

const ThemeLayout = () => {
    // Persisted in localStorage and applied to <html layout="…">.
    const [layout, setLayout] = useLocalStorageSetting("layout", "hydrogen");

    useEffect(() => {
        document.documentElement.setAttribute("layout", layout);
    }, [layout]);

    const handleLayoutClick = (selectedLayout: string) => {
        setLayout(selectedLayout);
    };

    return (
        <div className="theme-setting-item">
            <h6 className="font-medium text-base mb-3">Theme Layout</h6>

            <div className="grid grid-cols-3 gap-4">
                {layouts.map((item, index) => (
                    <div className="" key={index}>
                        <div
                            className={`cursor-pointer border border-neutral-300 flex items-center justify-center hover:bg-primary/10 duration-300 h-[92px] rounded-md ring-2 dark:border-slate-500 ${layout === item.text
                                ? "ring-primary text-primary dark:text-primary"
                                : "ring-transparent text-neutral-500 dark:text-white"
                                }`}
                            onClick={() => handleLayoutClick(item.text)}
                        >
                            {item.icon}
                        </div>
                        <h6
                            className={`text-center capitalize text-sm font-medium pt-2 cursor-pointer hover:text-blue-500 ${layout === item.text
                                ? "text-primary dark:text-primary"
                                : "text-neutral-500 dark:text-neutral-200"
                                }`}
                            onClick={() => handleLayoutClick(item.text)}
                        >
                            {item.text}
                        </h6>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ThemeLayout;
