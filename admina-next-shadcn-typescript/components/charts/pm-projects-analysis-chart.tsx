"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PmProjectsAnalysisChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bar", height: 440, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primary, "#22c55e", "#facc15", "#f87171"],
    plotOptions: { bar: { columnWidth: "60%", borderRadius: 4, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["Mon", "Tue", "We", "Th", "Fr", "Sat", "Su"],
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { min: 0, max: 400, tickAmount: 4, labels: { style: { fontSize: "12px", colors: "#9ca3af" } } },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: { shared: true, intersect: false },
  };

  const series = [
    { name: "Projects", data: [315, 325, 295, 325, 385, 295, 275] },
    { name: "Progress", data: [215, 185, 195, 230, 285, 200, 185] },
    { name: "Tasks", data: [150, 230, 200, 155, 190, 140, 120] },
    { name: "Revenue", data: [95, 75, 100, 95, 35, 90, 60] },
  ];

  return <Chart options={options} series={series} type="bar" height={440} />;
};

export default PmProjectsAnalysisChart;
