"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SalesRevenueChart = () => {
  const options: ApexOptions = {
    chart: { type: "area", height: 440, toolbar: { show: false }, zoom: { enabled: false } },
    colors: ["#06b6d4", "#f87171"],
    stroke: { curve: "smooth", width: 2, dashArray: [6, 0] },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 4 } },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { min: 0, max: 300, tickAmount: 5, labels: { style: { fontSize: "12px", colors: "#9ca3af" } } },
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
    { name: "Delivered", data: [10, 95, 40, 130, 55, 200, 60, 235, 70, 210, 90, 225] },
    { name: "Cancelled", data: [5, 60, 30, 80, 40, 110, 45, 120, 50, 110, 55, 118] },
  ];

  return <Chart options={options} series={series} type="area" height={440} />;
};

export default SalesRevenueChart;
