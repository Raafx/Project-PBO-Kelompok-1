"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const FinanceInvestmentChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 360 },
    labels: ["Net Income", "Real Estate", "Business"],
    colors: [primary, "#06b6d4", "#f87171"],
    stroke: { width: 4, colors: ["#fff"] },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: "70%" } } },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[45, 30, 25]} type="donut" height={360} />;
};

export default FinanceInvestmentChart;
