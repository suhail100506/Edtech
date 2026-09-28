"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { COLOR_PALETTE } from "@/lib/constants";

interface HorizontalBarItem {
  label: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
  unit?: string;
}

interface HorizontalBarChartProps {
  data: HorizontalBarItem[];
  valueKey?: string;
  highlightColor?: string;
  defaultColor?: string;
  height?: number;
  maxValue?: number;
  showValueLabel?: boolean;
}

export function HorizontalBarChart({
  data,
  highlightColor = COLOR_PALETTE.primary,
  defaultColor = "#94A3B8",
  height = 260,
  maxValue,
}: HorizontalBarChartProps) {
  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 35, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
          <XAxis
            type="number"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
            domain={[0, maxValue || "dataMax + 5"]}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={120}
            tick={{ fill: "#0F172A", fontWeight: 500 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as HorizontalBarItem;
                return (
                  <div className="rounded-xl border border-border bg-surface p-2.5 shadow-md text-xs">
                    <p className="font-semibold text-text">{item.label}</p>
                    <p className="text-primary font-bold">
                      {item.value}% {item.unit || "importance"}
                    </p>
                    {item.highlight && (
                      <p className="text-[10px] text-emerald-600 font-medium mt-1">
                        ★ Primary Predictive Signal
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            maxBarSize={24}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.highlight ? highlightColor : defaultColor}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
