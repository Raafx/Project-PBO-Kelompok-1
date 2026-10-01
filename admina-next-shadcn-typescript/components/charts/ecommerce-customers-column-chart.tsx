"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommerceCustomersColumnChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 80,
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: { columnWidth: "40%", borderRadius: 3 },
    },
    colors: [primary],
    fill: { opacity: [1, 0.3, 1, 0.3, 1, 0.3, 1] },
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
  };

  const series = [{ name: "Customers", data: [60, 40, 75, 35, 90, 50, 70] }];

  return <Chart options={options} series={series} type="bar" height={80} />;
};

export default EcommerceCustomersColumnChart;
