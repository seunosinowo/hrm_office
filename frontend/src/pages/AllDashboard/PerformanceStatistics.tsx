import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function PerformanceStatistics() {
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 280,
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: "50%",
        },
        dataLabels: {
          name: {
            fontSize: "14px",
            color: "#6B7280",
          },
          value: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "#111827",
          },
          total: {
            show: true,
            label: "Overall",
            formatter: function () {
              return "78%";
            },
          },
        },
      },
    },
    colors: ["#4F46E5", "#10B981", "#F59E0B"],
    labels: ["Technical Skills", "Soft Skills", "Leadership"],
    stroke: {
      lineCap: "round",
    },
  };

  const series = [85, 72, 65];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Performance Statistics
      </h3>
      <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
        Average competency scores by category
      </p>

      <div className="mt-6">
        <Chart options={options} series={series} type="radialBar" height={280} />
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="block size-3 rounded-full bg-indigo-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Technical Skills
            </span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            85%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="block size-3 rounded-full bg-emerald-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Soft Skills
            </span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            72%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="block size-3 rounded-full bg-amber-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Leadership
            </span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            65%
          </span>
        </div>
      </div>
    </div>
  );
}