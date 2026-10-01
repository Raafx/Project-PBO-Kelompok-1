"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsPerformanceOverviewChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bubble", height: 410, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primary, "#facc15", "#4ade80", "#f87171", "#22d3ee", "#e879f9"],
    fill: { type: "solid", opacity: 0.85 },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    xaxis: {
      type: "numeric",
      min: 0,
      max: 1000,
      tickAmount: 5,
      labels: {
        formatter: (val) => {
          const n = Math.round(Number(val));
          return n === 0 || n === 1000 ? String(n) : "";
        },
        style: { fontSize: "11px", colors: "#9ca3af" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 100000,
      tickAmount: 5,
      labels: {
        formatter: (val) => `$${val / 1000}K`,
        style: { fontSize: "11px", colors: "#9ca3af" },
      },
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
      itemMargin: { horizontal: 10, vertical: 8 },
      labels: { colors: "#6B7280" },
    },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const name = w.config.series[seriesIndex].name;
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        return `<div style="padding:8px 12px; font-size:12px;"><strong>${name}</strong><br>Visitors: ${data.x}<br>Revenue: $${data.y / 1000}K</div>`;
      },
    },
  };

  const series = [
    { name: "Email", data: [{ x: 380, y: 80000, z: 38 }] },
    { name: "Organic Search", data: [{ x: 130, y: 21000, z: 26 }] },
    { name: "Direct Browser", data: [{ x: 300, y: 50000, z: 34 }] },
    { name: "Paid Search", data: [{ x: 820, y: 60000, z: 32 }] },
    { name: "Social", data: [{ x: 600, y: 42000, z: 24 }] },
    { name: "Referral", data: [{ x: 850, y: 21000, z: 26 }] },
  ];

  return <Chart options={options} series={series} type="bubble" height={410} />;
};

export default AnalyticsPerformanceOverviewChart;
