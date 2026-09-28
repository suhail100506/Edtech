"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RadialGaugeProps {
  value: number; // 0 to 100
  title: string;
  subtitle?: string;
  type?: "risk" | "completion";
  size?: number;
  className?: string;
}

export function RadialGauge({
  value,
  title,
  subtitle,
  type = "risk",
  size = 180,
  className,
}: RadialGaugeProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 240 degree gauge arc for gauge look
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  let color = "#2563EB";
  let statusText = "Normal";

  if (type === "risk") {
    if (clampedValue > 66) {
      color = "#DC2626"; // High risk
      statusText = "High Risk";
    } else if (clampedValue >= 33) {
      color = "#D97706"; // Medium risk
      statusText = "Medium Risk";
    } else {
      color = "#16A34A"; // Low risk
      statusText = "Low Risk";
    }
  } else {
    // Completion Probability
    if (clampedValue >= 66) {
      color = "#16A34A";
      statusText = "High Likelihood";
    } else if (clampedValue >= 33) {
      color = "#D97706";
      statusText = "Moderate Likelihood";
    } else {
      color = "#DC2626";
      statusText = "Low Likelihood";
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-surface text-center",
        className
      )}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg] transition-all duration-700 ease-out"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-text">
            {Math.round(clampedValue)}%
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5"
            style={{ color, backgroundColor: `${color}15` }}
          >
            {statusText}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <h4 className="text-sm font-semibold text-text">{title}</h4>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5 max-w-[200px] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
