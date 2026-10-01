"use client";

import NftUser from "@/public/assets/images/nft/nft-user-img1.png";
import { Diamond, Share2, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const INITIAL = { days: 145, hours: 8, minutes: 35, seconds: 41 };
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const breakdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

const NftDetailCard = () => {
  const [time, setTime] = useState(INITIAL);

  useEffect(() => {
    const startMs =
      (INITIAL.days * 86400 + INITIAL.hours * 3600 + INITIAL.minutes * 60 + INITIAL.seconds) * 1000;
    const target = Date.now() + startMs;
    const tick = () => setTime(breakdown(target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const fields: { label: string; value: string }[] = [
    { label: "Days", value: `${time.days}` },
    { label: "Hours", value: pad(time.hours) },
    { label: "Minutes", value: pad(time.minutes) },
    { label: "Seconds", value: pad(time.seconds) },
  ];

  return (
    <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <Image src={NftUser} alt="Creator" className="w-12 h-12 rounded-full shrink-0 object-cover" />
          <div>
            <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">Trendy Fashion Portraits</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Artwork</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Share"
          className="w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center text-neutral-500 dark:text-neutral-300 shrink-0"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="w-11 h-11 bg-primary/10 flex items-center justify-center rounded-full text-primary shrink-0">
          <Diamond className="w-5 h-5" />
        </span>
        <div>
          <h2 className="font-bold mb-0 text-2xl text-neutral-900 dark:text-white">346.12 ETH</h2>
          <span className="text-green-600 dark:text-green-500 text-xs font-semibold inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            88.5% <span className="text-neutral-500 dark:text-neutral-400 font-normal">This Month</span>
          </span>
        </div>
      </div>

      <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-5">
        NFT art is a digital asset that is collectable, unique, and non-transferrable, Cortes explained Every NFT is unique duplicated.
      </p>

      <div className="flex items-center justify-between gap-2 pb-5 mb-5 border-b border-neutral-200 dark:border-neutral-600">
        <div>
          <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1">Current Bid</span>
          <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">342.74 ETH</h2>
        </div>
        <div className="text-right">
          <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal block mb-1">Highest Bid</span>
          <h2 className="font-bold mb-0 text-base text-neutral-900 dark:text-white">346.67 ETH</h2>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 mb-6">
        {fields.map((f, i) => (
          <div key={f.label} className="flex items-start gap-2 grow">
            <div className="text-center grow">
              <span className="text-neutral-500 dark:text-neutral-400 text-xs block mb-2">{f.label}</span>
              <span className="flex items-center justify-center h-12 rounded-xl bg-neutral-100 dark:bg-neutral-700 text-lg font-bold text-neutral-900 dark:text-white">
                {f.value}
              </span>
            </div>
            {i < fields.length - 1 && (
              <span className="self-end pb-3 text-lg font-bold text-neutral-400">:</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-3 font-semibold text-sm text-center grow">
          View Details
        </button>
        <button type="button" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-3 font-semibold text-sm text-center grow">
          Bid Now
        </button>
      </div>
    </div>
  );
};

export default NftDetailCard;
