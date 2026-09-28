"use client";

import React from "react";
import Link from "next/link";
import { useDataset } from "@/lib/context/DatasetContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/shared/RiskBadge";
import {
  SIGNAL_TO_ACTION_MAPPING,
  INTERVENTION_LEVELS,
} from "@/lib/constants";
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Users,
  Compass,
} from "lucide-react";

export default function InterventionsPage() {
  const { risk } = useDataset();

  const tiers = [
    {
      level: "High" as const,
      count: risk.high.count,
      pct: risk.high.percentage,
      icon: ShieldAlert,
      config: INTERVENTION_LEVELS.High,
      href: "/learners?risk=High",
    },
    {
      level: "Medium" as const,
      count: risk.medium.count,
      pct: risk.medium.percentage,
      icon: AlertTriangle,
      config: INTERVENTION_LEVELS.Medium,
      href: "/learners?risk=Medium",
    },
    {
      level: "Low" as const,
      count: risk.low.count,
      pct: risk.low.percentage,
      icon: ShieldCheck,
      config: INTERVENTION_LEVELS.Low,
      href: "/learners?risk=Low",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Targeted Academic Interventions"
        description="Prescriptive pedagogical workflows, proactive nudges, and behavioral signal-to-action playbooks designed to reverse dropout trajectories."
      />

      {/* 3 Columns: Interventions by Risk Level */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const { config } = tier;

          return (
            <Card
              key={tier.level}
              className={`border border-border border-t-4 ${config.borderColor} flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${config.color}15`,
                        color: config.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{tier.level} Risk Tier</CardTitle>
                  </div>
                  <RiskBadge level={tier.level} />
                </div>
                <CardDescription className="text-xs pt-1">
                  {config.title}
                </CardDescription>

                {/* Affected Count Metric */}
                <div className="mt-4 rounded-xl bg-surface-muted/50 border border-border p-3 flex items-center justify-between">
                  <span className="text-xs text-text-muted flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Students Affected:
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-text">
                      {tier.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-text-muted ml-1">({tier.pct}%)</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Recommended Action Protocol:
                  </span>
                  <div className="space-y-2">
                    {config.actions.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 text-xs flex items-start gap-2.5 transition-colors hover:bg-slate-50"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1 leading-relaxed text-text">
                          {act.text}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            act.priority === "Urgent"
                              ? "bg-rose-100 text-rose-800"
                              : act.priority === "High"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {act.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <Link href={tier.href} className="w-full block">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold hover:bg-primary-soft hover:text-primary hover:border-primary/40"
                  >
                    <span>View {tier.count} {tier.level}-Risk Learners</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Signal -> Action Mapping Matrix */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Signal-to-Action Intervention Playbook
              </CardTitle>
              <CardDescription>
                Systematic mapping between specific telemetry deficits and validated pedagogical responses
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-text-muted bg-slate-100 px-2.5 py-1 rounded-lg">
              6 Core Playbooks
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surface-muted/70 border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="p-3.5 font-semibold">Behavioral Trigger Signal</th>
                  <th className="p-3.5 font-semibold">Model Predictive Significance</th>
                  <th className="p-3.5 font-semibold">Recommended Pedagogical Action</th>
                  <th className="p-3.5 font-semibold text-center">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white text-xs">
                {SIGNAL_TO_ACTION_MAPPING.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-semibold text-text">{item.signal}</td>
                    <td className="p-3.5 text-text-muted font-medium">{item.indicator}</td>
                    <td className="p-3.5 text-text leading-relaxed">{item.recommendedAction}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block font-bold text-[11px] px-2 py-0.5 rounded-full ${
                          item.urgency === "High"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
