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
  ReferenceLine,
  Cell,
} from "recharts";
import { COLOR_PALETTE } from "@/lib/constants";

interface CourseCompletionItem {
  Course_ID: string;
  courseName: string;
  completionRate: number;
  learnerCount: number;
}

interface CompletionByCourseChartProps {
  data: CourseCompletionItem[];
  overallAvg: number;
  height?: number;
  onSelectCourse?: (courseId: string) => void;
}

export function CompletionByCourseChart({
  data,
  overallAvg,
  height = 300,
  onSelectCourse,
}: CompletionByCourseChartProps) {
  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="Course_ID"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CourseCompletionItem;
                const diff = (item.completionRate - overallAvg).toFixed(1);
                const isAbove = Number(diff) >= 0;

                return (
                  <div className="rounded-xl border border-border bg-surface p-3 shadow-lg text-xs space-y-1 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text">{item.Course_ID}</span>
                      <span className="text-[11px] text-text-muted">
                        {item.learnerCount} learners
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate max-w-[220px]">
                      {item.courseName}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-border font-semibold">
                      <span>Completion Rate:</span>
                      <span className="text-primary font-bold">
                        {item.completionRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-muted">vs Average ({overallAvg}%):</span>
                      <span
                        className={
                          isAbove
                            ? "text-emerald-600 font-semibold"
                            : "text-rose-600 font-semibold"
                        }
                      >
                        {isAbove ? `+${diff}%` : `${diff}%`}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={overallAvg}
            stroke="#64748B"
            strokeDasharray="4 4"
            label={{
              value: `Avg: ${overallAvg}%`,
              position: "insideTopRight",
              fill: "#64748B",
              fontSize: 11,
              offset: 10,
            }}
          />
          <Bar
            dataKey="completionRate"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
            animationDuration={800}
            onClick={(entry: unknown) => {
              const item = entry as { payload?: { Course_ID?: string }; Course_ID?: string };
              const courseId = item?.payload?.Course_ID || item?.Course_ID;
              if (onSelectCourse && courseId) {
                onSelectCourse(courseId);
              }
            }}
            className="cursor-pointer"
          >
            {data.map((entry, index) => {
              // Below 45% is highlighted as low-completion courses needing review
              const isLow = entry.completionRate < 45;
              const isHigh = entry.completionRate >= 65;
              return (
                <Cell
                  key={`bar-${index}`}
                  fill={
                    isLow
                      ? COLOR_PALETTE.danger
                      : isHigh
                      ? COLOR_PALETTE.secondary
                      : COLOR_PALETTE.primary
                  }
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
