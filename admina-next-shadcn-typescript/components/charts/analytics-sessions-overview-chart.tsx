"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsSessionsOverviewChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "area", height: 320, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: [2, 2] },
    colors: [primary, "#22c55e"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: ["#ffffff", "#ffffff"],
        opacityFrom: 0.5,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    markers: { size: 0 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: Array.from({ length: 30 }, (_, i) => i + 1),
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 30000,
      tickAmount: 3,
      labels: {
        formatter: (val) => `${val / 1000}k`,
        style: { fontSize: "11px", colors: "#9ca3af" },
      },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    annotations: {
      xaxis: [{ x: 6, borderColor: "#ef4444", strokeDashArray: 4, borderWidth: 1 }],
    },
    legend: { show: false },
    tooltip: { shared: true, intersect: false },
  };

  const series = [
    {
      name: "Total Visitors",
      data: [18000, 19500, 18500, 17000, 17500, 14500, 16000, 17500, 18000, 17000, 19000, 19500, 18500, 19500, 21000, 20000, 21500, 19000, 20000, 23500, 23000, 20500, 20000, 19500, 20000, 21000, 19500, 20500, 21500, 22000],
    },
    {
      name: "Page Views",
      data: [22000, 23500, 22500, 21000, 21500, 19000, 21500, 21000, 21500, 21500, 22000, 22500, 21500, 22500, 24000, 23000, 24500, 22000, 22500, 26500, 25500, 23000, 22500, 22000, 22500, 23000, 22000, 22500, 23500, 24000],
    },
  ];

  return <Chart options={options} series={series} type="area" height={320} />;
};

export default AnalyticsSessionsOverviewChart;
