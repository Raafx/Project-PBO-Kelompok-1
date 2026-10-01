"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommerceRevenueBarChart = () => {
  const { primary, primaryLight } = usePrimaryColor();

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 80,
      width: 130,
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        columnWidth: "65%",
        borderRadius: 3,
        distributed: true,
      },
    },
    colors: [primaryLight, primaryLight, primaryLight, primaryLight, primary, primaryLight],
    dataLabels: { enabled: false },
    tooltip: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
  };

  const series = [{ name: "Revenue", data: [20, 30, 25, 35, 90, 25] }];

  return <Chart options={options} series={series} type="bar" height={80} width={130} />;
};

export default EcommerceRevenueBarChart;
