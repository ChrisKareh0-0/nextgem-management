"use client";

import dynamic from "next/dynamic";

// Import the ApexCharts component dynamically to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type ChartDataItem = {
  x: string;
  y: number;
};

type ClientPaymentsChartProps = {
  data: ChartDataItem[];
};

export function ClientPaymentsChart({ data }: ClientPaymentsChartProps) {
  // Define chart options
  const options = {
    chart: {
      type: "bar" as const,
      height: 350,
      toolbar: {
        show: false,
      },
      fontFamily: "Plus Jakarta Sans, sans-serif",
    },
    colors: ["#3C50E0"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "55%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: data.map((item) => item.x),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#A9A9C8",
          fontSize: "12px",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => {
          return value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`;
        },
        style: {
          colors: "#A9A9C8",
          fontSize: "12px",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontWeight: 500,
        },
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
    grid: {
      show: true,
      strokeDashArray: 7,
      borderColor: "#EFEFEF",
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => {
          return `$${value.toFixed(2)}`;
        },
      },
      style: {
        fontSize: "12px",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      },
    },
  };

  const series = [
    {
      name: "Monthly Payments Due",
      data: data.map((item) => item.y),
    },
  ];

  return (
    <div className="mb-2">
      <div id="clientPaymentsChart" className="mx-auto">
        {typeof window !== "undefined" && (
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        )}
      </div>
    </div>
  );
} 