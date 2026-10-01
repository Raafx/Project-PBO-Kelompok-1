"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: number[];
  /** Fixed color; omit for reactive primary. */
  color?: string;
}

const FinanceWaveChart = ({ data, color }: Props) => {
  const { primary } = usePrimaryColor();
  const c = color ?? primary;

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 90,
      width: "100%",
      sparkline: { enabled: true },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [c],
    stroke: { curve: "smooth", width: 2, colors: [c] },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.95, opacityTo: 0.03, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    tooltip: { enabled: false },
    grid: { show: false },
  };

  return <Chart options={options} series={[{ name: "Value", data }]} type="area" height={90} />;
};

export default FinanceWaveChart;
