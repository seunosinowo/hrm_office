import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function CompetencyGapAnalysis() {
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 320,
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ["#10B981", "#F59E0B", "#EF4444"],
    labels: ["Met", "Partially Met", "Not Met"],
    legend: {
      position: "bottom",
      horizontalAlign: "left",
      fontSize: "13px",
      markers: {
        size: 10,
      },
      itemMargin: {
        horizontal: 9,
        vertical: 12
      },
      onItemClick: {
        toggleDataSeries: false
      },
      floating: false,
      offsetY: 5,
      offsetX: 0,
      formatter: function(seriesName) {
        if (seriesName === "Partially Met") {
          return "  " + seriesName;
        }
        return seriesName;
      },
      labels: {
        colors: ["#6B7280", "#6B7280", "#6B7280"],
        useSeriesColors: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          background: "transparent",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              color: "#6B7280",
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: "bold",
              color: "#111827",
              offsetY: 5,
              formatter: function (val) {
                return val + "%";
              },
            },
            total: {
              show: true,
              label: "Competency Gap",
              formatter: function () {
                return "22%";
              },
              color: "#111827",
              fontSize: "14px",
              fontWeight: "bold"
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            width: "100%",
            height: 320,
          },
          legend: {
            position: "bottom",
            horizontalAlign: "left",
            offsetY: 5,
            itemMargin: {
              horizontal: 9,
              vertical: 12
            }
          },
        },
      },
    ],
  };

  const series = [65, 20, 15];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Competency Gap Analysis
      </h3>
      <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
        Current vs required competency levels
      </p>

      <div className="mt-6 flex items-center justify-center">
        <div className="w-full max-w-[320px]">
          <Chart options={options} series={series} type="donut" height={320} />
        </div>
      </div>
    </div>
  );
}