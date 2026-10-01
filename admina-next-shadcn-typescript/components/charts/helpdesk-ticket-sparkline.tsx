"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: number[];
  /** Fixed line color; omit for the reactive primary color. */
  color?: string;
  markerIndex?: number;
}

const HelpdeskTicketSparkline = ({ data, color, markerIndex }: Props) => {
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
    stroke: { curve: "straight", width: 2, colors: [c] },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.9, opacityTo: 0.02, stops: [0, 100] },
    },
    markers:
      markerIndex != null
        ? {
            size: 0,
            colors: ["#fff"],
            strokeColors: c,
            strokeWidth: 2,
            discrete: [{ seriesIndex: 0, dataPointIndex: markerIndex, fillColor: c, strokeColor: "#fff", size: 5 }],
          }
        : { size: 0 },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    grid: { show: false },
  };

  return <Chart options={options} series={[{ name: "Tickets", data }]} type="area" height={90} />;
};

export default HelpdeskTicketSparkline;
