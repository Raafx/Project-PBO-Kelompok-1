"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsUserByDeviceChart = () => {
  const { primary } = usePrimaryColor();
  const colors = [primary, "#22c55e", "#f87171"];

  const options: ApexOptions = {
    chart: { type: "radar", height: 460, toolbar: { show: false } },
    xaxis: {
      categories: ["Jul", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      labels: {
        style: { fontSize: "12px", colors: Array(7).fill("#9ca3af") },
      },
    },
    yaxis: { show: false, min: 0, max: 100 },
    colors,
    fill: { opacity: 0.15 },
    stroke: { width: 1.5, colors },
    markers: { size: 4, colors, strokeWidth: 0 },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: "#e5e7eb",
          connectorColors: "#e5e7eb",
          fill: { colors: ["transparent", "transparent"] },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  const series = [
    { name: "Desktop", data: [55, 70, 35, 50, 40, 45, 90] },
    { name: "Mobile", data: [60, 30, 40, 75, 95, 55, 50] },
    { name: "Others", data: [40, 45, 55, 95, 30, 35, 60] },
  ];

  return <Chart options={options} series={series} type="radar" height={460} />;
};

export default AnalyticsUserByDeviceChart;
