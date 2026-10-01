"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CryptoAssetsDonut = () => {
  const options: ApexOptions = {
    chart: { type: "donut", height: 300 },
    labels: ["Ethereum", "Bitcoin", "Litecoin", "Uniswap"],
    colors: ["#f87171", "#facc15", "#06b6d4", "#22c55e"],
    stroke: { width: 3, colors: ["#fff"] },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: "76%" } } },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[20, 35, 15, 30]} type="donut" height={300} />;
};

export default CryptoAssetsDonut;
