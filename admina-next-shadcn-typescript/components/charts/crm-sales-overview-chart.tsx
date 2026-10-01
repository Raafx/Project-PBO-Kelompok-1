"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CrmSalesOverviewChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { height: 320, type: "line", toolbar: { show: false }, zoom: { enabled: false } },
    colors: ["#22c55e", "#facc15", "#06b6d4", primary],
    stroke: { curve: "smooth", width: [0, 0, 2, 2], dashArray: [0, 0, 0, 5] },
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 3, borderRadiusApplication: "end" } },
    fill: {
      type: ["solid", "solid", "gradient", "solid"],
      opacity: [1, 1, 0.25, 1],
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 100] },
    },
    markers: { size: 0, hover: { size: 4 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 80,
      tickAmount: 4,
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    tooltip: { shared: true, intersect: false },
  };

  const series = [
    { name: "Sales", type: "column", data: [37, 30, 33, 40, 43, 55, 48, 60, 58, 70, 65, 76] },
    { name: "Orders", type: "column", data: [20, 15, 18, 16, 20, 22, 18, 28, 25, 30, 28, 33] },
    { name: "Trend", type: "area", data: [22, 24, 30, 33, 40, 55, 68, 58, 62, 70, 68, 72] },
    { name: "Target", type: "line", data: [18, 19, 20, 22, 24, 26, 25, 28, 30, 31, 32, 33] },
  ];

  return <Chart options={options} series={series} type="line" height={320} />;
};

export default CrmSalesOverviewChart;
