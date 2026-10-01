"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const HelpdeskClientsSatisfactionChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "pie", height: 360 },
    labels: ["Highly Satisfied", "Unsatisfied", "Satisfied"],
    colors: [primary, "#06b6d4", "#facc15"],
    stroke: { width: 3, colors: ["#fff"] },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { y: { formatter: (val) => `${val}%` } },
  };

  return <Chart options={options} series={[40, 30, 30]} type="pie" height={360} />;
};

export default HelpdeskClientsSatisfactionChart;
