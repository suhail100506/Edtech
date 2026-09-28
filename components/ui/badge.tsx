import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white",
        secondary:
          "border-transparent bg-secondary text-white",
        outline:
          "border-border text-text bg-surface",
        subtle:
          "border-blue-200 bg-primary-soft text-primary font-semibold",
        success:
          "border-emerald-200 bg-secondary-soft text-secondary-hover font-semibold",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 font-semibold",
        danger:
          "border-rose-200 bg-rose-50 text-rose-700 font-semibold",
        neutral:
          "border-slate-200 bg-slate-100 text-slate-700 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
