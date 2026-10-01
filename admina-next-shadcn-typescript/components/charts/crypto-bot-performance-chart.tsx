"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CryptoBotPerformanceChart = () => {
  const { primary } = usePrimaryColor();
  const colors = [primary, "#06b6d4", "#facc15", "#f87171", "#22c55e", "#d946ef"];

  const options: ApexOptions = {
    chart: { type: "rangeBar", height: 380, toolbar: { show: false }, zoom: { enabled: false } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%", borderRadius: 0, borderRadiusApplication: "around", distributed: true },
    },
    colors,
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      type: "category",
      labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 3000,
      tickAmount: 6,
      labels: {
        formatter: (val) => new Intl.NumberFormat("en-US").format(Math.round(val)),
        style: { fontSize: "12px", colors: "#9ca3af" },
      },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    tooltip: {
      custom: (opts) => {
        const pt = opts.w.config.series[0].data[opts.dataPointIndex];
        const value = pt.y[1] - pt.y[0];
        return `<div style="padding:8px 12px; font-size:12px;"><strong>${pt.x}</strong><br>Value: ${new Intl.NumberFormat("en-US").format(value)}</div>`;
      },
    },
  };

  const series = [
    {
      name: "Performance",
      data: [
        { x: "Total Bot", y: [0, 2880] },
        { x: "Signal Bot", y: [1680, 2880] },
        { x: "DCA Bot", y: [1480, 1660] },
        { x: "Arbitrage Bot", y: [1210, 1420] },
        { x: "Grid Bot", y: [280, 1180] },
        { x: "Pump Screener", y: [40, 280] },
      ],
    },
  ];

  return <Chart options={options} series={series} type="rangeBar" height={380} />;
};

export default CryptoBotPerformanceChart;
