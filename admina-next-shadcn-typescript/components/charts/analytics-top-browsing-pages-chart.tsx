"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsTopBrowsingPagesChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "bar", height: 160, toolbar: { show: false }, sparkline: { enabled: true } },
    plotOptions: { bar: { columnWidth: "45%", borderRadius: 0, borderRadiusApplication: "end" } },
    colors: [primary],
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    grid: { show: false },
  };

  const series = [{ data: [18, 30, 42, 18, 37, 26, 11, 34, 15, 22] }];

  return <Chart options={options} series={series} type="bar" height={160} />;
};

export default AnalyticsTopBrowsingPagesChart;
