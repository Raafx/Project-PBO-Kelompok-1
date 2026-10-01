"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const FinanceMarketingOuterChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 240 },
    labels: ["Sponsorship", "Events", "Marketing", "Ad Campaign", "Social Media", "Back Links", "Email"],
    colors: ["#d946ef", "#facc15", "#f97316", "#f87171", "#06b6d4", "#22d3ee", primary],
    stroke: { width: 2, colors: ["#fff"] },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: "58%" } } },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[8, 12, 30, 8, 14, 14, 14]} type="donut" height={240} />;
};

export default FinanceMarketingOuterChart;
