"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const FinanceReceivablesPayableChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bar", height: 460, toolbar: { show: false }, zoom: { enabled: false } },
    colors: [primary, "#facc15"],
    plotOptions: { bar: { columnWidth: "60%", borderRadius: 3, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 210,
      tickAmount: 7,
      labels: { style: { fontSize: "11px", colors: "#9ca3af" } },
    },
    grid: {
      borderColor: "#ffffff00",
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    annotations: {
      yaxis: [
        {
          y: 48.07,
          borderColor: "#facc15",
          strokeDashArray: 5,
          label: { text: "48.07", position: "right", textAnchor: "start", offsetX: 6, borderColor: "#facc15", style: { color: "#fff", background: "#facc15", fontSize: "11px", fontWeight: 600 } },
        },
        {
          y: 41.63,
          borderColor: primary,
          strokeDashArray: 5,
          label: { text: "41.63", position: "right", textAnchor: "start", offsetX: 6, borderColor: primary, style: { color: "#fff", background: primary, fontSize: "11px", fontWeight: 600 } },
        },
      ],
      points: [
        { x: "Aug", y: 182, marker: { size: 5, fillColor: "#facc15", strokeColor: "#fff", strokeWidth: 2 }, label: { text: "182.2", offsetY: -4, borderColor: "#facc15", style: { color: "#fff", background: "#facc15", fontSize: "11px", fontWeight: 600 } } },
        { x: "Aug", y: 162, marker: { size: 5, fillColor: primary, strokeColor: "#fff", strokeWidth: 2 }, label: { text: "62", offsetY: -4, borderColor: primary, style: { color: "#fff", background: primary, fontSize: "11px", fontWeight: 600 } } },
        { x: "Dec", y: 2.3, marker: { size: 5, fillColor: "#facc15", strokeColor: "#fff", strokeWidth: 2 }, label: { text: "2.3", offsetY: -4, borderColor: "#facc15", style: { color: "#fff", background: "#facc15", fontSize: "11px", fontWeight: 600 } } },
        { x: "Jan", y: 5, marker: { size: 6, fillColor: primary, strokeColor: "#fff", strokeWidth: 2 } },
      ],
    },
    legend: { show: false },
    tooltip: { shared: true, intersect: false },
  };

  const series = [
    { name: "Payable", data: [5, 3, 6, 22, 24, 75, 135, 162, 32, 18, 5, 3] },
    { name: "Receivables", data: [2, 8, 10, 20, 28, 68, 172, 182, 48, 22, 18, 2.3] },
  ];

  return <Chart options={options} series={series} type="bar" height={460} />;
};

export default FinanceReceivablesPayableChart;
