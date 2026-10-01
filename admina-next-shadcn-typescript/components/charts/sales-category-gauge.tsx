"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  value: number;
  color: string;
}

const SalesCategoryGauge = ({ value, color }: Props) => {
  const options: ApexOptions = {
    chart: { type: "radialBar", height: 96, width: 96, sparkline: { enabled: true } },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: "54%" },
        track: { background: "#eef0f3", strokeWidth: "100%", margin: 2 },
        dataLabels: {
          name: { show: false },
          value: { show: true, offsetY: 5, fontSize: "13px", fontWeight: 700, color: "#1f2937", formatter: (v) => `${Math.round(v)}%` },
        },
      },
    },
    stroke: { lineCap: "round" },
  };

  return <Chart options={options} series={[value]} type="radialBar" height={96} width={96} />;
};

export default SalesCategoryGauge;
