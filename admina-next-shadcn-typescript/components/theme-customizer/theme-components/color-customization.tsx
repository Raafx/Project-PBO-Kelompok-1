"use client";

import { Check } from "lucide-react";
import { useLocalStorageSetting } from "@/hooks/use-local-storage-setting";
import React, { useEffect } from "react";

const colors = [
    { name: "Blue", hex: "rgb(56, 114, 250)" },
    { name: "Black", hex: "rgb(17, 17, 17)" },
    { name: "Teal", hex: "rgb(13, 148, 136)" },
    { name: "Violet", hex: "rgb(124, 58, 237)" },
    { name: "Rose", hex: "rgb(225, 29, 72)" },
    { name: "Yellow", hex: "rgb(202, 138, 4)" },
];

// Pick white or black text based on background brightness.
const getContrastColor = (color: string) => {
    const [r, g, b] = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150 ? "rgb(17, 17, 17)" : "rgb(255, 255, 255)";
};

const ColorCustomization: React.FC = () => {
    // Persisted in localStorage; empty string means "use the default theme color".
    const [selectedColor, setSelectedColor] = useLocalStorageSetting("primaryColor", "");

    useEffect(() => {
        if (!selectedColor) return;
        document.documentElement.style.setProperty("--primary", selectedColor);
        document.documentElement.style.setProperty("--primary-foreground", getContrastColor(selectedColor));
    }, [selectedColor]);

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
    };

    return (
        <div className="theme-setting-item">
            <h6 className="font-medium text-base mb-3">Color Scheme</h6>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {colors.map((color) => (
                    <div
                        key={color.name}
                        className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                    >
                        <div className="relative w-full">
                            <button
                                title={color.name}
                                onClick={() => handleColorChange(color.hex)}
                                className={`grid w-full place-content-center gap-2 rounded-md border-2 py-1.5 shadow-sm transition duration-300 focus-visible:outline-none h-[38px] !cursor-pointer
                                    ${selectedColor === color.hex ? "border-primary ring-2 ring-offset-2" : "border-transparent"}
                                `}
                                style={
                                    {
                                        backgroundColor: color.hex,
                                        "--tw-ring-color": selectedColor === color.hex ? color.hex : "transparent",
                                    } as React.CSSProperties
                                }
                            />
                            {
                                selectedColor === color.hex && (
                                    <span className="absolute top-[50%] start-[50%] translate-x-[-50%] translate-y-[-50%] rtl:-translate-x-[-50%]">
                                        <Check className="text-white" />
                                    </span>
                                )
                            }
                        </div>
                        <span className="font-medium" style={{ color: color.hex }}>
                            {color.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ColorCustomization;

