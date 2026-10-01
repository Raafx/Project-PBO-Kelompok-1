"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommerceSalesOverviewChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 290,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: [2, 2] },
    colors: [primary, "#eab308"],
    xaxis: {
      categories: [
        "01 Jan", "02 Jan", "03 Jan", "04 Jan", "05 Jan", "06 Jan", "06 Jan",
        "07 Jan", "08 Jan", "09 Jan", "10 Jan", "11 Jan", "12 Jan", "12 Jan",
        "12 Jan", "12 Jan", "12 Jan",
      ],
      tickAmount: 6,
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
      min: 0,
      max: 100,
      tickAmount: 5,
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    markers: {
      size: 0,
      strokeWidth: 2,
      hover: { size: 5 },
      discrete: [
        { seriesIndex: 0, dataPointIndex: 6, fillColor: primary, strokeColor: "#fff", size: 5 },
        { seriesIndex: 0, dataPointIndex: 13, fillColor: primary, strokeColor: "#fff", size: 5 },
        { seriesIndex: 0, dataPointIndex: 16, fillColor: primary, strokeColor: "#fff", size: 5 },
        { seriesIndex: 1, dataPointIndex: 3, fillColor: "#eab308", strokeColor: "#fff", size: 5 },
        { seriesIndex: 1, dataPointIndex: 9, fillColor: "#eab308", strokeColor: "#fff", size: 5 },
        { seriesIndex: 1, dataPointIndex: 14, fillColor: "#eab308", strokeColor: "#fff", size: 5 },
      ],
    },
    annotations: {
      xaxis: [{ x: "06 Jan", borderColor: "#00b8f2", strokeDashArray: 4, borderWidth: 1.5 }],
    },
    tooltip: { shared: true },
  };

  const series = [
    { name: "This Year", data: [75, 75, 68, 38, 36, 38, 70, 70, 60, 58, 58, 45, 42, 18, 18, 18, 50] },
    { name: "Last Year", data: [33, 33, 50, 62, 62, 60, 18, 18, 60, 60, 50, 50, 33, 33, 80, 80, 80] },
  ];

  return <Chart options={options} series={series} type="line" height={290} />;
};

export default EcommerceSalesOverviewChart;
