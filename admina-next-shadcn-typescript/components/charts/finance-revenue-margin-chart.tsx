"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const FinanceRevenueMarginChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bar", height: 240, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primary, "#ff9f29"],
    plotOptions: { bar: { columnWidth: "30%", borderRadius: 4 } },
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
      labels: { formatter: (val) => `${Math.round(val)}`, style: { fontSize: "12px", colors: "#9ca3af" } },
    },
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
    { name: "Revenue", data: [19000, 15500, 13000, 23500, 43000, 16500, 26500, 10500, 25000, 46500, 16500, 21000] },
    { name: "Operating Margin", data: [13000, 16000, 18500, 19000, 33500, 18500, 16500, 12000, 16500, 36500, 12500, 15000] },
  ];

  return <Chart options={options} series={series} type="bar" height={240} />;
};

export default FinanceRevenueMarginChart;
