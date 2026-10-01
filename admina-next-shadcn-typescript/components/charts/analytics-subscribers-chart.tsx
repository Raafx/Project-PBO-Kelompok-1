"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/**
 * "Equal height, varying width" bar set for Total Subscribers.
 * Uses a fixed indigo tint scale (decorative monochrome ramp) matching the legend.
 */
const AnalyticsSubscribersChart = () => {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 160,
      width: "100%",
      toolbar: { show: false },
      sparkline: { enabled: true },
      animations: { enabled: false },
    },
    plotOptions: { bar: { columnWidth: "96%", borderRadius: 6, distributed: true } },
    colors: ["#e0e7ff", "#c7d2fe", "#a5b4fc", "#6366f1", "#4338ca"],
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { enabled: false },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    grid: { show: false },
  };

  const series = [
    {
      data: [
        { x: "Email Marketing", y: 100 },
        { x: "Social Marketing", y: 100 },
        { x: "Direct", y: 100 },
        { x: "Referral", y: 100 },
        { x: "Organic Search", y: 100 },
      ],
    },
  ];

  return <Chart options={options} series={series} type="bar" height={160} />;
};

export default AnalyticsSubscribersChart;
