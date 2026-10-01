"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommercePaymentMethodsChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "polarArea", height: 430, toolbar: { show: false } },
    labels: ["Visa", "Strips", "Google Pay", "PayPal", "Apple Pay"],
    colors: [primary, "#FDC70F", "#F6776E", "#00B8D9", "#22C55E"],
    fill: { opacity: 1 },
    stroke: { width: 0, colors: ["#fff"] },
    plotOptions: {
      polarArea: {
        rings: { strokeWidth: 0 },
        spokes: { strokeWidth: 0 },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_val, opts) => opts.w.globals.labels[opts.seriesIndex],
      style: { fontSize: "16px", fontWeight: 500, colors: ["#333"] },
      background: { enabled: false },
      dropShadow: { enabled: false },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "13px",
      fontWeight: 500,
      markers: { size: 5 },
      itemMargin: { horizontal: 10, vertical: 4 },
      labels: { colors: "#6B7280" },
    },
    yaxis: { show: false },
    xaxis: { labels: { show: false } },
    grid: { show: false },
    tooltip: { y: { formatter: (val) => `${val}%` } },
    theme: { monochrome: { enabled: false } },
  };

  return <Chart options={options} series={[30, 25, 15, 20, 10]} type="polarArea" height={430} />;
};

export default EcommercePaymentMethodsChart;
