"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CryptoPortfolioPerformanceChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "area", height: 360, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primary, "#22c55e"],
    stroke: { curve: "straight", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.02, stops: [0, 100] },
    },
    markers: { size: 4, strokeWidth: 2, strokeColors: "#fff", colors: [primary, "#22c55e"], hover: { size: 6 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 600,
      tickAmount: 6,
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "13px",
      fontWeight: 500,
      markers: { size: 5 },
      itemMargin: { horizontal: 12, vertical: 8 },
      labels: { colors: "#6B7280" },
    },
    tooltip: { shared: true, intersect: false },
  };

  const series = [
    { name: "Portfolio", data: [335, 310, 290, 365, 380, 555, 520] },
    { name: "Benchmark", data: [113, 125, 97, 128, 85, 225, 205] },
  ];

  return <Chart options={options} series={series} type="area" height={360} />;
};

export default CryptoPortfolioPerformanceChart;
