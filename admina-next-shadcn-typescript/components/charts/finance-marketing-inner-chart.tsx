"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const FinanceMarketingInnerChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 130 },
    labels: ["Influencer", "Revenue", "Google Ads", "Audit Report"],
    colors: ["#1f2937", primary, "#84cc16", "#22c55e"],
    stroke: { width: 2, colors: ["#fff"] },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: "48%" } } },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[15, 48, 15, 22]} type="donut" height={130} />;
};

export default FinanceMarketingInnerChart;
