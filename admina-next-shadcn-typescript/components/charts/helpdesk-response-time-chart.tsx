"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const HelpdeskResponseTimeChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "area", height: 230, toolbar: { show: false }, zoom: { enabled: false } },
    colors: ["#06b6d4", primary],
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.8, opacityTo: 0.05, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: {
      min: 0,
      max: 10,
      tickAmount: 10,
      labels: {
        formatter: (val) => {
          const n = Math.round(val);
          return n === 0 || n === 2 || n === 5 || n === 10 ? `${n}H` : "";
        },
        style: { fontSize: "11px", colors: "#9ca3af" },
      },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 0, right: 0 },
    },
    legend: { show: false },
    tooltip: { shared: true, intersect: false, y: { formatter: (val) => `${val}H` } },
  };

  const series = [
    { name: "Ave Resolution Time", data: [4.5, 6.5, 8, 6, 4.5, 7, 8.2, 6, 4.5, 6.5, 8, 6.5, 5] },
    { name: "First Response Time", data: [2, 3, 4, 3, 2, 3.5, 4.2, 3, 2, 3, 4, 3, 2.5] },
  ];

  return <Chart options={options} series={series} type="area" height={230} />;
};

export default HelpdeskResponseTimeChart;
