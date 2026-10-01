"use client";

import { usePrimaryColor } from "@/hooks/use-primary-color";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EcommerceConversionRadialChart = () => {
  const { primary, primaryLight } = usePrimaryColor();

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 90,
      width: 90,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,
        hollow: { size: "70%" },
        track: { background: primaryLight, strokeWidth: "100%", margin: 0 },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "12px",
            fontWeight: 500,
            color: primary,
            offsetY: 0,
            show: true,
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: { colors: [primary] },
    stroke: { lineCap: "round" },
    labels: ["Conversion Rate"],
  };

  return <Chart options={options} series={[35.5]} type="radialBar" height={90} width={90} />;
};

export default EcommerceConversionRadialChart;
