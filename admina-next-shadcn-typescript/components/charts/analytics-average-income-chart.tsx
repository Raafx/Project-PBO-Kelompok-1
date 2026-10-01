"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsAverageIncomeChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bar", height: 520, toolbar: { show: false }, zoom: { enabled: false } },
    plotOptions: {
      bar: { horizontal: true, barHeight: "80%", borderRadius: 0, borderRadiusApplication: "end" },
    },
    colors: [primary, "#22d3ee"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 0 },
    xaxis: {
      categories: ["World", "China", "India", "USA", "Italy", "Brazil"],
      labels: {
        formatter: (val) => new Intl.NumberFormat("en-US").format(Number(val)),
        style: { fontSize: "10px", colors: "#9ca3af" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      max: 700000,
      tickAmount: 7,
    },
    yaxis: { labels: { style: { fontSize: "11px", colors: "#64748b", fontWeight: 500 } } },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: {
      shared: false,
      y: { formatter: (val) => `$${new Intl.NumberFormat("en-US").format(val)}` },
    },
  };

  const series = [
    { name: "This Year", data: [625000, 180000, 150000, 60000, 35000, 25000] },
    { name: "Last Year", data: [680000, 175000, 195000, 55000, 30000, 20000] },
  ];

  return <Chart options={options} series={series} type="bar" height={520} />;
};

export default AnalyticsAverageIncomeChart;
