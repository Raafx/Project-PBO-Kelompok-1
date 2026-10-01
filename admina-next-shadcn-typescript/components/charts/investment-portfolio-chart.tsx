"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const InvestmentPortfolioChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "area", height: 320, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primary],
    stroke: { curve: "straight", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    markers: { size: 4, colors: [primary], strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    xaxis: {
      categories: ["Sun", "", "", "Mon", "", "", "Tue", "", "", "Wed", "", "", "Thu", "", "", "Fri", "", "", "Sat", "", ""],
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 85,
      max: 135,
      tickAmount: 5,
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: { shared: true, intersect: false, x: { show: false } },
  };

  const series = [
    { name: "Portfolio", data: [100, 102, 99, 101, 98, 103, 100, 102, 99, 105, 108, 112, 104, 98, 96, 95, 97, 99, 98, 100, 99] },
  ];

  return <Chart options={options} series={series} type="area" height={320} />;
};

export default InvestmentPortfolioChart;
