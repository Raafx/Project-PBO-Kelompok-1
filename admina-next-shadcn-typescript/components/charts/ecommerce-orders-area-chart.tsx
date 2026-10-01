"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommerceOrdersAreaChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 80,
      sparkline: { enabled: true },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0 },
    },
    colors: [primary],
    tooltip: { enabled: true },
    dataLabels: { enabled: false },
  };

  const series = [
    { name: "Orders", data: [30, 45, 32, 50, 40, 60, 38, 55, 42, 58, 35, 48, 52, 40, 46] },
  ];

  return <Chart options={options} series={series} type="area" height={80} />;
};

export default EcommerceOrdersAreaChart;
