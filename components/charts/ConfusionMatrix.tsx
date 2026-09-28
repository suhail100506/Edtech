"use client";

import React from "react";
import { ConfusionMatrixData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConfusionMatrixProps {
  data: ConfusionMatrixData;
  className?: string;
}

export function ConfusionMatrix({ data, className }: ConfusionMatrixProps) {
  const { tp, fp, fn, tn, total } = data;

  const maxVal = Math.max(tp, fp, fn, tn);

  // Compute blue background intensity based on relative value
  const getBlueBg = (val: number) => {
    const ratio = val / maxVal;
    if (ratio > 0.8) return "bg-blue-600 text-white";
    if (ratio > 0.5) return "bg-blue-400 text-white";
    if (ratio > 0.25) return "bg-blue-200 text-blue-950";
    return "bg-blue-50 text-blue-900 border border-blue-100";
  };

  const tpPct = ((tp / total) * 100).toFixed(1);
  const fpPct = ((fp / total) * 100).toFixed(1);
  const fnPct = ((fn / total) * 100).toFixed(1);
  const tnPct = ((tn / total) * 100).toFixed(1);

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        {/* Matrix Header Label */}
        <div className="text-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Predicted Class (Model Output)
          </span>
          <div className="grid grid-cols-2 gap-3 mt-1 text-center font-semibold text-xs text-text">
            <span>Predicted Completed</span>
            <span>Predicted Not Completed</span>
          </div>
        </div>

        {/* Matrix Body with Actual row labels */}
        <div className="flex gap-2">
          {/* Vertical Actual Class Label */}
          <div className="flex flex-col justify-between py-6 text-xs font-bold uppercase tracking-wider text-text-muted [writing-mode:vertical-lr] rotate-180 text-center">
            <span>Actual Completed</span>
            <span>Actual Dropped</span>
          </div>

          {/* 2x2 Heatmap Grid */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {/* TP */}
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl p-5 text-center transition-all shadow-sm",
                getBlueBg(tp)
              )}
            >
              <span className="text-xs font-semibold opacity-90">True Positive (TP)</span>
              <span className="text-2xl lg:text-3xl font-extrabold my-1">{tp.toLocaleString()}</span>
              <span className="text-[11px] opacity-80">{tpPct}% of test cohort</span>
              <span className="text-[10px] mt-1 font-medium bg-black/10 px-2 py-0.5 rounded-full">
                Correctly identified completers
              </span>
            </div>

            {/* FN */}
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl p-5 text-center transition-all shadow-sm",
                getBlueBg(fn)
              )}
            >
              <span className="text-xs font-semibold opacity-90">False Negative (FN)</span>
              <span className="text-2xl lg:text-3xl font-extrabold my-1">{fn.toLocaleString()}</span>
              <span className="text-[11px] opacity-80">{fnPct}% of test cohort</span>
              <span className="text-[10px] mt-1 font-medium bg-black/10 px-2 py-0.5 rounded-full">
                Completer missed by model
              </span>
            </div>

            {/* FP */}
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl p-5 text-center transition-all shadow-sm",
                getBlueBg(fp)
              )}
            >
              <span className="text-xs font-semibold opacity-90">False Positive (FP)</span>
              <span className="text-2xl lg:text-3xl font-extrabold my-1">{fp.toLocaleString()}</span>
              <span className="text-[11px] opacity-80">{fpPct}% of test cohort</span>
              <span className="text-[10px] mt-1 font-medium bg-black/10 px-2 py-0.5 rounded-full">
                Non-completer predicted complete
              </span>
            </div>

            {/* TN */}
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl p-5 text-center transition-all shadow-sm",
                getBlueBg(tn)
              )}
            >
              <span className="text-xs font-semibold opacity-90">True Negative (TN)</span>
              <span className="text-2xl lg:text-3xl font-extrabold my-1">{tn.toLocaleString()}</span>
              <span className="text-[11px] opacity-80">{tnPct}% of test cohort</span>
              <span className="text-[10px] mt-1 font-medium bg-black/10 px-2 py-0.5 rounded-full">
                Correctly identified dropouts
              </span>
            </div>
          </div>
        </div>

        {/* Legend / Metrics Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border">
          <span>Test Sample: N = {total.toLocaleString()}</span>
          <span>True Positives: {tp}</span>
          <span>True Negatives: {tn}</span>
        </div>
      </div>
    </div>
  );
}
