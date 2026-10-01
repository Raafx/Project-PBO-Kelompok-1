"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/** Deterministic pseudo-random OHLC walk (matches the template's fixed seed). */
const buildData = () => {
  let seed = 73;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const start = Date.UTC(2024, 9, 6, 0, 0, 0);
  const data: { x: number; y: number[] }[] = [];
  for (let i = 0; i < 24; i++) {
    const mid = 6610 + Math.sin((i / 23) * Math.PI) * -22;
    const o = mid + (rnd() - 0.5) * 14;
    const c = mid + (rnd() - 0.5) * 14;
    const h = Math.max(o, c) + rnd() * 8;
    const l = Math.min(o, c) - rnd() * 8;
    data.push({ x: start + i * 3600 * 1000, y: [r2(o), r2(h), r2(l), r2(c)] });
  }
  return data;
};

const seriesData = buildData();

const CryptoStatsCandlestick = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "candlestick", height: 390, toolbar: { show: false }, zoom: { enabled: false } },
    plotOptions: {
      candlestick: {
        colors: { upward: "#22d3ee", downward: primary },
        wick: { useFillColor: true },
      },
    },
    xaxis: {
      type: "datetime",
      tickAmount: 5,
      labels: { datetimeUTC: true, format: "dd MMM HH:mm", style: { fontSize: "11px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 6560,
      max: 6660,
      tickAmount: 5,
      labels: { formatter: (val) => val.toFixed(2), style: { fontSize: "11px", colors: "#9ca3af" } },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
  };

  return <Chart options={options} series={[{ data: seriesData }]} type="candlestick" height={390} />;
};

export default CryptoStatsCandlestick;
