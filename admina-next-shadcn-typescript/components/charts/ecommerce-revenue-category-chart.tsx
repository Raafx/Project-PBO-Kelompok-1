"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommerceRevenueCategoryChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 320 },
    colors: [primary, "#f87171", "#00b8f2", "#a855f7", "#22c55e", "#eab308"],
    labels: ["Fashion", "Beauty", "Medical", "Sports", "Electronics", "Furniture"],
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 60,
        donut: {
          size: "65%",
          labels: {
            show: false,
            total: {
              show: true,
              label: "Total Products",
              fontSize: "12px",
              color: "#9ca3af",
              formatter: () => "25.59K",
            },
            value: { show: false },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2 },
    grid: { padding: { bottom: -80 } },
  };

  return <Chart options={options} series={[30, 20, 15, 12, 13, 10]} type="donut" height={320} />;
};

export default EcommerceRevenueCategoryChart;
