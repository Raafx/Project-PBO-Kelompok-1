"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  value: number;
  color: string;
}

const CryptoAvgRing = ({ value, color }: Props) => {
  const options: ApexOptions = {
    chart: { type: "radialBar", height: 90, width: 90, sparkline: { enabled: true } },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: "55%" },
        track: { background: "#eef1f6", strokeWidth: "100%" },
        dataLabels: {
          name: { show: false },
          value: { show: true, offsetY: 5, fontSize: "13px", fontWeight: 700, color: "#1f2937", formatter: (v) => `${v}%` },
        },
      },
    },
    stroke: { lineCap: "round", dashArray: 3 },
  };

  return <Chart options={options} series={[value]} type="radialBar" height={90} width={90} />;
};

export default CryptoAvgRing;
