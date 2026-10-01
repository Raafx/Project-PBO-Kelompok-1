"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const series = [
  { name: "Artworks", data: [20000, 15000, 14000, 22000, 47000, 13000, 20000, 10000, 22000, 45000, 15000, 20000] },
  { name: "Auction", data: [12000, 14000, 12000, 15000, 34000, 13000, 14000, 9000, 12000, 37000, 11000, 14000] },
];

const options: ApexOptions = {
  chart: {
    type: "bar",
    height: 300,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ["#7c5cfc", "#facc15"],
  plotOptions: {
    bar: { columnWidth: "45%", borderRadius: 4, borderRadiusApplication: "end" },
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 3, colors: ["transparent"] },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    max: 50000,
    tickAmount: 5,
    labels: {
      style: { fontSize: "12px", colors: "#9ca3af" },
      formatter: (value) => `${(value / 1000).toFixed(0)}k`,
    },
  },
  grid: {
    borderColor: "#9ca3af33",
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  legend: { show: false },
  tooltip: { shared: true, intersect: false },
};

const NftMarketplaceChart = () => {
  return <Chart options={options} series={series} type="bar" height={300} />;
};

export default NftMarketplaceChart;
