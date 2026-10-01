"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: number[];
  /** Fixed line color; when omitted the reactive primary color is used. */
  color?: string;
  /** Chart size — defaults to 120×60. Pass smaller values to fit a tighter card slot. */
  width?: number;
  height?: number;
}

const AnalyticsStatSparkline = ({ data, color, width = 120, height = 60 }: Props) => {
  const { primary } = usePrimaryColor();
  const lineColor = color ?? primary;

  const options: ApexOptions = {
    chart: {
      type: "line",
      height,
      width,
      sparkline: { enabled: true },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: "straight", width: 2.5, colors: [lineColor] },
    fill: { opacity: 1 },
    markers: { size: 0 },
    colors: [lineColor],
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    grid: { show: false },
  };

  return <Chart options={options} series={[{ data }]} type="line" height={height} width={width} />;
};

export default AnalyticsStatSparkline;
