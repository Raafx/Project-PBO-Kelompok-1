"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const CrmLeadSourceChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 300 },
    labels: ["Newsletter", "Instagram", "LinkedIn", "WhatsApp", "Telegram", "Website"],
    colors: [primary, "#d946ef", "#06b6d4", "#22c55e", "#facc15", "#ef4444"],
    stroke: { width: 3, colors: ["#fff"] },
    plotOptions: {
      pie: { startAngle: -90, endAngle: 90, offsetY: 20, donut: { size: "68%" } },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { y: { formatter: (val) => `${val}%` } },
    grid: { padding: { bottom: -90 } },
  };

  return <Chart options={options} series={[30, 9, 17, 17, 15, 12]} type="donut" height={300} />;
};

export default CrmLeadSourceChart;
