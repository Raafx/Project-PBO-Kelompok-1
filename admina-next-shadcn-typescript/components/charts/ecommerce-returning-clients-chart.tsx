"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommerceReturningClientsChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 180,
      sparkline: { enabled: true },
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: ["#ffffff"],
        opacityFrom: 0.6,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    colors: [primary],
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
  };

  const series = [{ name: "Retention", data: [60, 75, 55, 80, 65, 85, 70, 90, 75, 85] }];

  return <Chart options={options} series={series} type="area" height={180} />;
};

export default EcommerceReturningClientsChart;
