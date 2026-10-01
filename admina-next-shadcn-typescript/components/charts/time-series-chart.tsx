"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Chart data
const dates = [
  { x: 1327359600000, y: 30.95 },
  { x: 1327446000000, y: 31.34 },
  { x: 1327532400000, y: 31.18 },
  { x: 1327618800000, y: 31.05 },
  { x: 1327878000000, y: 31.0 },
  { x: 1327964400000, y: 30.95 },
  { x: 1328050800000, y: 31.24 },
  { x: 1328137200000, y: 31.29 },
  { x: 1328223600000, y: 31.85 },
  { x: 1328482800000, y: 31.86 },
  { x: 1328569200000, y: 32.28 },
  { x: 1328655600000, y: 32.1 },
  { x: 1328742000000, y: 32.65 },
  { x: 1328828400000, y: 32.21 },
  { x: 1329087600000, y: 32.35 },
  { x: 1329174000000, y: 32.44 },
  { x: 1329260400000, y: 32.46 },
  { x: 1329346800000, y: 32.86 },
  { x: 1329433200000, y: 32.75 },
];

// Chart options
const chartOptions: ApexOptions = {
  chart: {
    type: "area",
    height: 350,
    zoom: {
      enabled: true,
      type: "x",
      autoScaleYaxis: true,
    },
    toolbar: { show: false },
  },

  stroke: {
    curve: "straight", // looks better
    width: 2,
  },

  dataLabels: { enabled: false },
  markers: { size: 0 },

  grid: {
    borderColor: "#D1D5DB",
    strokeDashArray: 3,
  },

  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      gradientToColors: ["#487FFF"],
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 100],
    },
  },

  xaxis: {
    type: "datetime",
  },

  yaxis: {
    labels: {
      formatter: (val) => val.toFixed(2),
    },
    title: { text: "Price" },
  },

  tooltip: {
    y: {
      formatter: (val) => `$${val.toFixed(2)}`,
    },
  },
};

// Chart series
const chartSeries = [
  {
    name: "Bitcoin",
    data: dates,
  },
];

const TimeSeriesChart = () => {
  return (
    <div className="-m-4">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height={350}
      />
    </div>
  );
};

export default TimeSeriesChart;