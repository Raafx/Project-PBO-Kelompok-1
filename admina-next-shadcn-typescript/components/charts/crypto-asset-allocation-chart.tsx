"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CryptoAssetAllocationChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 280 },
    labels: ["BTC", "ETH", "SOL", "Others"],
    colors: [primary, "#22c55e", "#facc15", "#06b6d4"],
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: "78%" } } },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[48, 12, 25, 15]} type="donut" height={280} />;
};

export default CryptoAssetAllocationChart;
