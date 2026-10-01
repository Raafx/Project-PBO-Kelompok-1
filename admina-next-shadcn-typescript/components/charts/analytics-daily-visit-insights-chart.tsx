"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsDailyVisitInsightsChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bar", height: 380, toolbar: { show: false }, zoom: { enabled: false } },
    plotOptions: { bar: { columnWidth: "30%", borderRadius: 6, borderRadiusApplication: "end" } },
    colors: [primary, "#facc15"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["Sun", "Mo", "Tue", "Wed", "Thu", "Fri", "Sa"],
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false, min: 0, max: 100 },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    legend: { show: false },
  };

  const series = [
    { name: "Male", data: [20, 95, 25, 25, 55, 80, 45] },
    { name: "Female", data: [25, 60, 70, 50, 65, 55, 25] },
  ];

  return <Chart options={options} series={series} type="bar" height={380} />;
};

export default AnalyticsDailyVisitInsightsChart;
