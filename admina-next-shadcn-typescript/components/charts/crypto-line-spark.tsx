"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: number[];
  color: string;
  height?: number;
  width?: number;
}

const CryptoLineSpark = ({ data, color, height = 50, width = 100 }: Props) => {
  const options: ApexOptions = {
    chart: { type: "line", height, width, sparkline: { enabled: true }, toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: false } },
    stroke: { curve: "straight", width: 2.5, colors: [color] },
    colors: [color],
    markers: { size: 0 },
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    grid: { show: false },
  };

  return <Chart options={options} series={[{ data }]} type="line" height={height} width={width} />;
};

export default CryptoLineSpark;
