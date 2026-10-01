"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommerceCustomerGrowthChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 270,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
    },
    stroke: { curve: "straight", width: 2, colors: [primary] },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        gradientToColors: ["#ffffff"],
        opacityFrom: 0.95,
        opacityTo: 0.02,
        stops: [0, 100],
      },
      colors: [primary],
    },
    colors: [primary],
    dataLabels: { enabled: false },
    markers: { size: 0 },
    xaxis: {
      categories: [
        "Jan", "Jan", "Jan", "Jan", "Jan", "Jan", "Jan", "Feb", "Feb", "Feb", "Feb",
        "Feb", "Feb", "Feb", "Feb", "Feb", "Feb", "Feb", "Feb", "Feb", "Feb",
      ],
      labels: { style: { colors: "#94a3b8", fontSize: "12px", fontWeight: 400 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: 10,
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 0,
      max: 30000,
      tickAmount: 6,
      labels: {
        formatter: (val) => (val === 0 ? "0" : `${(val / 1000).toFixed(0)}k`),
        style: { colors: "#94a3b8", fontSize: "12px", fontWeight: 400 },
        offsetX: -4,
      },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${(val / 1000).toFixed(1)}k customers` },
    },
    legend: { show: false },
  };

  const series = [
    {
      name: "Customers",
      data: [
        18000, 20500, 19800, 20200, 23000, 24500, 24000, 21000, 21500, 20800, 21200,
        26000, 27500, 27000, 29000, 28500, 27800, 28200, 29500, 30000, 30200,
      ],
    },
  ];

  return <Chart options={options} series={series} type="area" height={270} />;
};

export default EcommerceCustomerGrowthChart;
