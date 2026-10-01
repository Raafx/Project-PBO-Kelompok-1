"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommerceOrderSummaryChart = () => {
  const { primary } = usePrimaryColor();

  const options: ApexOptions = {
    chart: { type: "donut", height: 280 },
    colors: [primary, "#00b8f2", "#f87171"],
    labels: ["Completed", "New Order", "Pending"],
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Orders",
              fontSize: "12px",
              color: "#9ca3af",
              formatter: () => "4.5K",
            },
            value: { show: false },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(Number(val))}%`,
      style: { fontSize: "12px", fontWeight: 500, colors: ["#fff"] },
      dropShadow: { enabled: false },
    },
    legend: { show: false },
    stroke: { width: 2 },
  };

  return <Chart options={options} series={[45, 30, 25]} type="donut" height={280} />;
};

export default EcommerceOrderSummaryChart;
