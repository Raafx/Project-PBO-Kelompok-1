"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const HelpdeskTicketsSolvedCreatedChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "area", height: 400, toolbar: { show: false }, zoom: { enabled: false } },
    colors: ["#facc15", primary],
    stroke: { curve: "smooth", width: 2, dashArray: [6, 0] },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.65, opacityTo: 0.02, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 4 } },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 300,
      tickAmount: 5,
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    annotations: {
      xaxis: [{ x: "Jul", borderColor: "#cbd5e1", strokeDashArray: 4, borderWidth: 1 }],
    },
    legend: { show: false },
    tooltip: { shared: true, intersect: false },
  };

  const series = [
    { name: "Tickets Created", data: [10, 105, 45, 140, 55, 205, 50, 235, 65, 215, 80, 225] },
    { name: "Tickets Solved", data: [5, 58, 25, 75, 35, 110, 30, 120, 38, 110, 45, 118] },
  ];

  return <Chart options={options} series={series} type="area" height={400} />;
};

export default HelpdeskTicketsSolvedCreatedChart;
