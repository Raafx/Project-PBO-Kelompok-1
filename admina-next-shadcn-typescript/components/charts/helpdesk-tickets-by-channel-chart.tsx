"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const HelpdeskTicketsByChannelChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "polarArea", height: 380 },
    labels: ["Email", "App", "Web", "Chat", "Tab"],
    colors: [primary, "#22c55e", "#f87171", "#06b6d4", "#facc15"],
    stroke: { colors: ["#fff"], width: 2 },
    fill: { opacity: 0.9 },
    dataLabels: { enabled: false },
    legend: { show: false },
    yaxis: { show: false },
    plotOptions: {
      polarArea: {
        rings: { strokeWidth: 1 },
        spokes: { strokeWidth: 1, connectorColors: "#e5e7eb" },
      },
    },
    tooltip: { y: { formatter: (val) => `${val} tickets` } },
  };

  return <Chart options={options} series={[80, 55, 60, 65, 70]} type="polarArea" height={380} />;
};

export default HelpdeskTicketsByChannelChart;
