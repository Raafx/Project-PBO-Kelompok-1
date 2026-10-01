"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsAudienceOverviewChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { height: 320, toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { curve: "smooth", width: [0, 0, 2] },
    colors: [primary, "#22c55e", "#ef4444"],
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 0, borderRadiusApplication: "end" } },
    fill: { opacity: [1, 1, 1] },
    markers: { size: 0, hover: { size: 5 } },
    xaxis: {
      categories: ["Mo", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 250,
      tickAmount: 5,
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
    { name: "New Visitors", type: "column", data: [2, 5, 8, 25, 28, 70, 175] },
    { name: "Previous Visitors", type: "column", data: [3, 6, 10, 22, 25, 80, 135] },
    { name: "Unique Visitors", type: "line", data: [18, 20, 30, 45, 65, 102, 220] },
  ];

  return <Chart options={options} series={series} height={320} />;
};

export default AnalyticsAudienceOverviewChart;
