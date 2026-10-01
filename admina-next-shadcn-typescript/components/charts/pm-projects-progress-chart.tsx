"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PmProjectsProgressChart = () => {
  const options: ApexOptions = {
    chart: { type: "donut", height: 280 },
    labels: ["Cancelled", "In Progress", "Pending", "Completed"],
    colors: ["#f87171", "#facc15", "#06b6d4", "#22c55e"],
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: "78%" } } },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[15, 48, 12, 25]} type="donut" height={280} />;
};

export default PmProjectsProgressChart;
