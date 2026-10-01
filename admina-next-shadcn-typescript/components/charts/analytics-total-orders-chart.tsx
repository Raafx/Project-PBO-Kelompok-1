"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsTotalOrdersChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bar", height: 390, toolbar: { show: false }, zoom: { enabled: false }, stacked: false },
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 0, borderRadiusApplication: "end" } },
    colors: [primary, "#22c55e"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ["transparent"] },
    xaxis: {
      categories: ["Mo", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 3500000,
      tickAmount: 4,
      labels: {
        formatter: (val) => new Intl.NumberFormat("en-US").format(Math.round(val)),
        style: { fontSize: "10px", colors: "#9ca3af" },
      },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
  };

  const series = [
    { name: "Orders", data: [3106000, 1850000, 1900000, 2400000, 2950000, 2050000, 3300000] },
    { name: "Refunds", data: [1553000, 925000, 950000, 1200000, 1475000, 1025000, 1650000] },
  ];

  return <Chart options={options} series={series} type="bar" height={390} />;
};

export default AnalyticsTotalOrdersChart;
