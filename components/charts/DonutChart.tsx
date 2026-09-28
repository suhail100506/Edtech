"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { COLOR_PALETTE } from "@/lib/constants";

interface DonutDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutDataPoint[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  height = 260,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0];
                const pct = total > 0 ? ((Number(item.value) / total) * 100).toFixed(1) : 0;
                return (
                  <div className="rounded-xl border border-border bg-surface p-2.5 shadow-md text-xs">
                    <p className="font-semibold text-text">{item.name}</p>
                    <p className="text-text-muted">
                      {Number(item.value).toLocaleString()} learners ({pct}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="88%"
            paddingAngle={3}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.color ||
                  COLOR_PALETTE.series[index % COLOR_PALETTE.series.length]
                }
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-medium text-text px-1">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label for Rate */}
      {centerValue && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
          <span className="text-2xl font-extrabold tracking-tight text-text">
            {centerValue}
          </span>
          {centerLabel && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
