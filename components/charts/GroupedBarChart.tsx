"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BehaviorComparison } from "@/lib/types";
import { COLOR_PALETTE } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface GroupedBarChartProps {
  data: BehaviorComparison[];
  height?: number;
}

export function GroupedBarChart({ data, height = 320 }: GroupedBarChartProps) {
  // Option to view as absolute values or normalized (0-100 scale)
  const [isNormalized, setIsNormalized] = useState<boolean>(true);

  // Normalization multipliers:
  // Video is already 0-100
  // Login max ~ 8 -> scale by 12.5
  // Quiz max ~ 5 -> scale by 20
  // Assignment max ~ 4 -> scale by 25
  // Discussion max ~ 5 -> scale by 20
  const normalizedData = data.map((item) => {
    let scale = 1;
    if (item.feature === "Login_Frequency") scale = 12.5;
    if (item.feature === "Quiz_Attempts") scale = 20;
    if (item.feature === "Assignment_Submissions") scale = 25;
    if (item.feature === "Discussion_Activity") scale = 20;

    return {
      name: item.label,
      feature: item.feature,
      unit: item.unit,
      rawCompleted: item.completed,
      rawNotCompleted: item.notCompleted,
      rawDiff: item.difference,
      Completed: isNormalized ? Math.round(item.completed * scale * 10) / 10 : item.completed,
      "Not Completed": isNormalized ? Math.round(item.notCompleted * scale * 10) / 10 : item.notCompleted,
    };
  });

  return (
    <div className="space-y-3">
      {/* Controls & Normalization Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg w-fit">
          <Button
            type="button"
            variant={isNormalized ? "subtle" : "ghost"}
            size="sm"
            onClick={() => setIsNormalized(true)}
            className="h-7 text-xs px-2.5 rounded-md"
          >
            Normalized (0-100 Index)
          </Button>
          <Button
            type="button"
            variant={!isNormalized ? "subtle" : "ghost"}
            size="sm"
            onClick={() => setIsNormalized(false)}
            className="h-7 text-xs px-2.5 rounded-md"
          >
            Raw Metric Values
          </Button>
        </div>
        <span className="text-text-muted italic">
          {isNormalized
            ? "Metrics indexed to 0-100 scale for direct visual comparison"
            : "Displaying unscaled raw metric units"}
        </span>
      </div>

      <div style={{ height, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={normalizedData}
            margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              interval={0}
              tick={{ fill: "#64748B" }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={isNormalized ? [0, 100] : [0, "auto"]}
              tickFormatter={(v) => (isNormalized ? `${v}` : `${v}`)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-surface p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
                      <p className="font-bold text-text border-b border-border pb-1">
                        {d.name}
                      </p>
                      <div className="flex items-center justify-between text-emerald-600 font-medium">
                        <span>Completed:</span>
                        <span className="font-bold">
                          {d.rawCompleted} {d.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-rose-600 font-medium">
                        <span>Not Completed:</span>
                        <span className="font-bold">
                          {d.rawNotCompleted} {d.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-text-muted pt-1 border-t border-border">
                        <span>Observed Gap:</span>
                        <span className="font-bold text-primary">
                          +{d.rawDiff} {d.unit}
                        </span>
                      </div>
                      {isNormalized && (
                        <p className="text-[10px] text-text-muted/70 italic pt-1">
                          Bar height reflects normalized 0-100 comparison index.
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 10 }}
              formatter={(value) => (
                <span className="text-xs font-semibold text-text px-1">{value}</span>
              )}
            />
            <Bar
              dataKey="Completed"
              fill={COLOR_PALETTE.completed}
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="Not Completed"
              fill={COLOR_PALETTE.notCompleted}
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
