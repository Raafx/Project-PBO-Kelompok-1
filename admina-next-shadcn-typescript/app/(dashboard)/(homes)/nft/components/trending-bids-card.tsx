"use client";

import { default as Item1, default as Item4 } from "@/public/assets/images/homes/nft-img1.png";
import { default as Item2, default as Item5 } from "@/public/assets/images/homes/nft-img2.png";
import { default as Item3, default as Item6 } from "@/public/assets/images/homes/nft-img3.png";
import Creator1 from "@/public/assets/images/nft/creator-img1.png";
import Creator2 from "@/public/assets/images/nft/creator-img2.png";
import Creator3 from "@/public/assets/images/nft/creator-img3.png";
import Creator4 from "@/public/assets/images/nft/creator-img4.png";
import { LineChart, Timer, TrendingUp } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import NftPeriodTabs from "./period-tabs";

interface Bid {
  image: StaticImageData;
  creator: StaticImageData;
  title: string;
  author: string;
  bid: string;
}

const bids: Bid[] = [
  { image: Item1, creator: Creator1, title: "Cyber Samurai", author: "Dimas Kamal", bid: "84.50 ETH" },
  { image: Item2, creator: Creator2, title: "Neon Dreams", author: "Andra Mahmud", bid: "146.75 ETH" },
  { image: Item3, creator: Creator3, title: "Abstract Waves", author: "Giring Furqon", bid: "245.00 ETH" },
  { image: Item4, creator: Creator4, title: "Pixel Voyage", author: "Lukman Farhan", bid: "115.00 ETH" },
  { image: Item5, creator: Creator1, title: "Golden Aura", author: "Farrel K.", bid: "312.99 ETH" },
  { image: Item6, creator: Creator2, title: "Retro Bloom", author: "Anika Islam", bid: "72.24 ETH" },
];

const DURATION = (2 * 3600 + 45 * 60 + 12) * 1000; // 02h : 45m : 12s
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const useAuctionTimer = () => {
  const [label, setLabel] = useState("02hrs : 45m : 12s");

  useEffect(() => {
    let target = Date.now() + DURATION;
    const tick = () => {
      let remaining = target - Date.now();
      if (remaining <= 0) {
        target = Date.now() + DURATION;
        remaining = DURATION;
      }
      const total = Math.floor(remaining / 1000);
      const h = Math.floor((total % 86400) / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      setLabel(`${pad(h)}hrs : ${pad(m)}m : ${pad(s)}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return label;
};

const TrendingBidsCard = () => {
  const timer = useAuctionTimer();

  return (
    <div className="bg-white dark:bg-[#273142] border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 h-full">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 bg-green-50 dark:bg-green-600/10 flex items-center justify-center rounded-full text-green-600 dark:text-green-500 shrink-0">
            <LineChart className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold mb-0 text-lg text-neutral-900 dark:text-white">Trending Bids</h2>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Current bids are trending upward significantly now.</span>
          </div>
        </div>
        <NftPeriodTabs size="md" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {bids.map((b) => (
          <div
            key={b.title}
            className="snap-start shrink-0 w-[240px] border border-neutral-200 dark:border-neutral-600 rounded-2xl p-3 bg-white dark:bg-[#273142]"
          >
            <div className="relative rounded-xl overflow-hidden mb-3">
              <Image src={b.image} alt={b.title} className="w-full h-40 object-cover" />
              <span className="absolute top-2 end-2 inline-flex items-center gap-1 rounded-full bg-black/60 text-white px-2.5 py-1 text-xs font-semibold backdrop-blur">
                <Timer className="w-3 h-3" />
                {timer}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Image src={b.creator} alt={b.author} className="w-7 h-7 rounded-full object-cover shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold mb-0 text-neutral-900 dark:text-white truncate">{b.title}</h3>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{b.author}</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-600">
              <div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">Current Bid</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-500" />
                  {b.bid}
                </span>
              </div>
              <button type="button" className="bg-primary hover:bg-primary/90 text-white rounded-full px-3 py-1.5 text-xs font-semibold shrink-0">
                Bid Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingBidsCard;
