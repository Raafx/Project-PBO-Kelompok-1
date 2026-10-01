"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const HelpdeskTicketsByTypeChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 370 },
    labels: ["Product Support", "General Inquiry", "Billing Inquiry", "Technical Issue"],
    colors: ["#f87171", "#06b6d4", "#facc15", primary],
    stroke: { width: 3, colors: ["#fff"] },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: "68%" } } },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[12, 35, 23, 30]} type="donut" height={370} />;
};

export default HelpdeskTicketsByTypeChart;
