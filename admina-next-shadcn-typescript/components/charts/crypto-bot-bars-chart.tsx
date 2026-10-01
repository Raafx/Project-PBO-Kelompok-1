"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: number[];
  colors: string[];
}

/** Mini distributed bar sparkline used inside each Active Trading Bot card. */
const CryptoBotBarsChart = ({ data, colors }: Props) => {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 56,
      width: 130,
      sparkline: { enabled: true },
      toolbar: { show: false },
      animations: { enabled: false },
    },
    plotOptions: {
      bar: { columnWidth: "60%", borderRadius: 2, borderRadiusApplication: "end", distributed: true },
    },
    colors,
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { enabled: false },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    grid: { show: false },
  };

  return <Chart options={options} series={[{ data }]} type="bar" height={56} width={130} />;
};

export default CryptoBotBarsChart;
