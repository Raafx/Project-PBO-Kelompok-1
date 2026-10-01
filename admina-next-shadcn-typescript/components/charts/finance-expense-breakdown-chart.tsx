"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const FinanceExpenseBreakdownChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 300 },
    labels: ["Marketing", "Rent", "Software", "Salaries"],
    colors: [primary, "#a5b4fc", "#818cf8", "#c7d2fe"],
    stroke: { width: 3, colors: ["#fff"] },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: "72%" } } },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[48, 25, 12, 15]} type="donut" height={300} />;
};

export default FinanceExpenseBreakdownChart;
