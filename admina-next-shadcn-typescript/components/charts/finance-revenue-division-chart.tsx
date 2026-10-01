"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const FinanceRevenueDivisionChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "polarArea", height: 260 },
    labels: ["Capital Solution", "Credits Strategies", "Capital Opportunities", "Fund Strategies"],
    colors: [primary, "#22c55e", "#facc15", "#06b6d4"],
    stroke: { colors: ["#fff"], width: 2 },
    fill: { opacity: 0.85 },
    dataLabels: { enabled: false },
    legend: { show: false },
    yaxis: { show: false },
    plotOptions: {
      polarArea: {
        rings: { strokeWidth: 1 },
        spokes: { strokeWidth: 1, connectorColors: "#e5e7eb" },
      },
    },
    tooltip: { y: { formatter: (val) => `$${val}K` } },
  };

  return <Chart options={options} series={[30, 55, 95, 80]} type="polarArea" height={260} />;
};

export default FinanceRevenueDivisionChart;
