"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PmRoadmapChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bar", height: 300, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primary, "#06b6d4", "#22c55e", "#facc15", "#f87171", "#a855f7"],
    plotOptions: {
      bar: { horizontal: true, barHeight: "55%", borderRadius: 4, borderRadiusApplication: "end", distributed: true },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: ["Project Planning", "Requirement", "Design", "Development", "Testing and QA", "Post-Launch"],
      min: 0,
      max: 140,
      tickAmount: 7,
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: "12px", colors: "#64748b" } } },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: { y: { formatter: (val) => `${val} days` } },
  };

  return <Chart options={options} series={[{ name: "Duration", data: [128, 28, 22, 7, 6, 6] }]} type="bar" height={300} />;
};

export default PmRoadmapChart;
