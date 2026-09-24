import React, { useEffect, useMemo, useState } from "react";
import { getRevenueByMonth } from "../data/api";

const formatPersianPrice = (price) => {
  if (!price) return "۰";
  const formatted = price.toLocaleString("fa-IR");
  return formatted.replace(/٬/g, "،");
};

const CHART_WIDTH = 550;
const X_PADDING = 15;
const Y_TOP = 10;
const Y_BOTTOM = 125;

// Turns raw income values into SVG coordinates for the line chart.
// Kept separate from the mock data on purpose so the chart still
// renders correctly if the backend sends a different number of months.
const buildChartPoints = (monthlyData) => {
  const incomes = monthlyData.map((m) => m.income);
  const minIncome = Math.min(...incomes);
  const maxIncome = Math.max(...incomes);
  const incomeRange = maxIncome - minIncome || 1;
  const step =
    monthlyData.length > 1
      ? (CHART_WIDTH - X_PADDING * 2) / (monthlyData.length - 1)
      : 0;

  return monthlyData.map((month, index) => ({
    ...month,
    x: X_PADDING + step * index,
    y: Y_BOTTOM - ((month.income - minIncome) / incomeRange) * (Y_BOTTOM - Y_TOP),
  }));
};

const RevenueChart = () => {
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    getRevenueByMonth().then(setMonthlyData);
  }, []);

  const chartData = useMemo(() => buildChartPoints(monthlyData), [monthlyData]);
  const [activeMonth, setActiveMonth] = useState(null);

  useEffect(() => {
    if (chartData.length > 0) setActiveMonth(chartData[chartData.length - 1]);
  }, [chartData]);

  const chartPoints = chartData.map((m) => `${m.x},${m.y}`).join(" ");
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);

  if (!activeMonth) {
    return (
      <div dir="rtl" className="w-full" style={{ fontFamily: "Pinar-FD" }}>
        <h3 className="text-[22px] font-bold text-black mb-3 text-right">
          نمودار درآمد در سال
        </h3>
        <div className="w-full bg-[#e6f0fa] border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] h-[220px]" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full" style={{ fontFamily: "Pinar-FD" }}>
      <h3 className="text-[22px] font-bold text-black mb-3 text-right">
        نمودار درآمد در سال
      </h3>

      <div className="w-full bg-[#e6f0fa] border border-black rounded-[5px] shadow-[0_4px_0_0_#000000] p-5 h-[220px] relative flex flex-col justify-between overflow-visible">
        {/* Total yearly income */}
        <div className="absolute top-4 left-4 text-right">
          <span className="text-[20px] font-bold text-black">
            {formatPersianPrice(totalIncome)}
          </span>
          <span className="text-[12px] text-gray-700 mr-1">تومان</span>
        </div>

        <div className="w-full h-[140px] mt-auto relative overflow-visible">
          <svg
            className="w-full h-full"
            viewBox="0 0 550 140"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area fill under the line */}
            <path
              d={`M 15,140 L ${chartPoints} L 540,140 Z`}
              fill="url(#chartGradient)"
              className="transition-all duration-300"
            />

            {/* Line itself */}
            <path
              d={`M ${chartPoints}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Marker for the active (hovered) month */}
            <circle
              cx={activeMonth.x}
              cy={activeMonth.y}
              r="6"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-200 ease-out"
            />
          </svg>

          {/* Floating tooltip following the active month */}
          <div
            className="absolute bg-[#1c1c1e] text-white rounded-[18px] px-4 py-1.5 flex flex-col items-center shadow-md select-none pointer-events-none transition-all duration-200 ease-out"
            style={{
              left: `${(activeMonth.x / 550) * 100}%`,
              transform: "translateX(-50%)",
              top: `${activeMonth.y - 68}px`,
            }}
          >
            <span className="text-[11px] text-gray-300 font-light">
              {activeMonth.name}
            </span>
            <span className="text-[12px] font-bold mt-0.5 text-white whitespace-nowrap">
              {formatPersianPrice(activeMonth.income)}{" "}
              <span className="text-[9px] font-normal text-gray-400">
                تومان
              </span>
            </span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1c1c1e] rotate-45"></div>
          </div>

          {/* Invisible hover zones, one per month, for mouse tracking */}
          <div className="absolute inset-0 flex" dir="ltr">
            {chartData.map((month) => (
              <div
                key={month.id}
                className="flex-1 h-full cursor-pointer bg-transparent"
                onMouseEnter={() => setActiveMonth(month)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
