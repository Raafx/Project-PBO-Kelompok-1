"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  value: number;
  color: string;
}

const PmProgressRing = ({ value, color }: Props) => {
  const options: ApexOptions = {
    chart: { type: "radialBar", height: 56, width: 56, sparkline: { enabled: true } },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: "48%" },
        track: { background: "#eef1f6", strokeWidth: "100%" },
        dataLabels: {
          name: { show: false },
          value: { show: true, offsetY: 4, fontSize: "11px", fontWeight: 600, color: "#1f2937", formatter: (v) => `${v}%` },
        },
      },
    },
    stroke: { lineCap: "round" },
  };

  return <Chart options={options} series={[value]} type="radialBar" height={56} width={56} />;
};

export default PmProgressRing;
