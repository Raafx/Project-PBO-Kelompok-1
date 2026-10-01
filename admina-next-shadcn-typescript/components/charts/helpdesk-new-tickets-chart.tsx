"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const HelpdeskNewTicketsChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bar", height: 340, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primary, "#22C55E", "#FDC70F", "#F6776E"],
    plotOptions: { bar: { columnWidth: "70%", borderRadius: 0, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["Mon", "Tue", "We", "Th", "Fr", "Sat", "Su"],
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 400,
      tickAmount: 4,
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
    },
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
    { name: "Low", data: [320, 330, 300, 330, 390, 300, 280] },
    { name: "Medium", data: [220, 180, 190, 230, 290, 200, 180] },
    { name: "High", data: [160, 230, 200, 160, 190, 150, 120] },
    { name: "Urgent", data: [100, 80, 100, 160, 45, 90, 65] },
  ];

  return <Chart options={options} series={series} type="bar" height={340} />;
};

export default HelpdeskNewTicketsChart;
