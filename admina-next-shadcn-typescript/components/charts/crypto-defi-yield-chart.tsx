"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const yields = [
  32.5, 32.8, 32.3, 33.0, 32.6, 32.9, 32.4, 32.7, 33.1, 32.5, 32.0, 31.6, 32.2, 31.8,
  31.2, 30.6, 30.1, 30.5, 30.0, 30.8, 31.3, 31.8, 32.4, 33.0, 32.6, 33.2, 32.8, 33.4,
  33.0, 32.5, 33.1, 32.7, 32.2, 32.8, 32.4, 32.0, 31.5, 32.1, 31.7, 32.3, 32.9, 33.3,
  33.6, 34.0, 33.5, 34.1, 33.7, 33.2, 33.8, 33.4, 32.9, 33.5, 33.0, 33.6, 34.0, 34.4,
  34.8, 35.4, 36.0, 36.6, 37.0, 37.5, 38.0, 38.3, 38.8, 38.4, 39.0, 38.6, 39.2, 38.9,
  39.3, 39.6, 39.2, 39.8, 39.4, 39.9, 40.1,
];

const CryptoDefiYieldChart = () => {
  const { primary } = usePrimaryColor();
  const data = yields.map((y, i) => ({ x: 1 + (i * 10) / (yields.length - 1), y }));

  const options: ApexOptions = {
    chart: { type: "area", height: 360, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primary],
    stroke: { curve: "straight", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.02, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 4 } },
    xaxis: {
      type: "numeric",
      min: 1,
      max: 11,
      tickAmount: 10,
      labels: {
        formatter: (val) => `W${Math.round(Number(val))}`,
        style: { fontSize: "12px", colors: "#9ca3af" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 27,
      max: 42,
      tickAmount: 5,
      labels: {
        formatter: (val) => val.toFixed(2),
        style: { fontSize: "12px", colors: "#9ca3af" },
      },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: {
      x: { formatter: (val) => `Week ${Math.round(val)}` },
      y: { formatter: (val) => val.toFixed(2) },
    },
  };

  return <Chart options={options} series={[{ name: "Yield", data }]} type="area" height={360} />;
};

export default CryptoDefiYieldChart;
