import React from "react";
import ReactECharts from "echarts-for-react";
import cpiData from "../data/parsedCPIData_with_full_predictions.json";

// 색상 팔레트 (최대 8개 시리즈 지원)
const palette = [
  "#3b82f6",
  "#ef4444",
  "#facc15",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#14b8a6",
];

/** 유효 CPI 값(placeholder 제외) */
const isValidValue = (v) => typeof v === "number" && v > 0 && v < 1000;

const CategoryChart = ({ categories = [], startDate, endDate }) => {
  /* ----------------------------- 1) X축 날짜 ----------------------------- */
  const dates = cpiData["CPI"].map((r) => r.날짜).filter((d) => d >= startDate && d <= endDate);

  /* ---------------------- 2) 카테고리별 시리즈 데이터 --------------------- */
  const series = categories.map((cat, idx) => {
    const recs = cpiData[cat] || [];
    const data = dates.map((date) => {
      const v = recs.find((r) => r.날짜 === date)?.값;
      return isValidValue(v) ? v : null;
    });
    return {
      name: cat,
      type: "line",
      data,
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 3 },
      color: palette[idx % palette.length],
    };
  });

  /* ------------------------ 3) Y축 범위 자동 계산 ------------------------ */
  const numeric = series.flatMap((s) => s.data).filter(isValidValue);
  const hasData = numeric.length > 0;
  let yMin = 0,
    yMax = 0,
    interval = 1;
  if (hasData) {
    const minVal = Math.min(...numeric);
    const maxVal = Math.max(...numeric);
    const span = Math.max(1, maxVal - minVal);
    interval = Math.max(0.5, Math.ceil((span / 5) * 10) / 10);
    yMin = Math.floor(minVal / interval) * interval;
    yMax = Math.ceil(maxVal / interval) * interval;
  }

  /* ------------------------------ 4) 옵션 ------------------------------ */
  const option = categories.length
    ? {
        color: palette,
        tooltip: { trigger: "axis" },
        legend: {
          top: 12, // 살짝 위로 배치
          left: "center",
          type: "scroll",
          orient: "horizontal",
          padding: [4, 16, 4, 16], // 상하 padding 줄여 간격 축소
          itemGap: 20,
          textStyle: { fontSize: 13, lineHeight: 17 },
        },
        grid: { left: 48, right: 20, top: 80, bottom: 60 }, // top 값 ↓ 120 -> 80
        xAxis: {
          type: "category",
          data: dates,
          axisLabel: { rotate: 45, fontSize: 11 },
          axisLine: { lineStyle: { color: "#9ca3af" } },
        },
        yAxis: {
          type: "value",
          min: hasData ? yMin : undefined,
          max: hasData ? yMax : undefined,
          interval: hasData ? interval : undefined,
          axisLabel: {
            fontSize: 11,
            formatter: (val) => (val >= 9000 ? "" : parseFloat(val).toFixed(1)),
          },
          axisLine: { lineStyle: { color: "#9ca3af" } },
        },
        series,
      }
    : {
        title: {
          text: "항목을 선택해주세요",
          left: "center",
          top: "middle",
          textStyle: { fontSize: 14, color: "#9ca3af" },
        },
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
        series: [],
      };

  /* ----------------------------- 5) 렌더링 ----------------------------- */
  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        padding: "12px 8px 8px 8px", // 상단 padding ↓ 16 -> 12
        margin: "4px 0",
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 10, // ↓ 12 -> 10
          color: "#111827",
          textAlign: "center",
        }}
      >
        {categories.length ? "품목별 추세 차트" : "품목 추세 차트"}
      </h3>
      <ReactECharts option={option} notMerge style={{ width: "100%", height: 320 }} />
    </div>
  );
};

export default CategoryChart;
