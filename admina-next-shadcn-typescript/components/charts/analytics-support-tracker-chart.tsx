"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsSupportTrackerChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 420 },
    labels: ["New Tickets", "Resolved Tickets", "Open Tickets", "Response Time"],
    colors: ["#06b6d4", primary, "#22c55e", "#facc15"],
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[25, 30, 20, 25]} type="donut" height={420} />;
};

export default AnalyticsSupportTrackerChart;
