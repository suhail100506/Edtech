import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-hover shadow-sm active:scale-[0.99]",
        secondary:
          "bg-secondary text-white hover:bg-secondary-hover shadow-sm active:scale-[0.99]",
        outline:
          "border border-border bg-surface text-text hover:bg-surface-muted hover:border-slate-300",
        ghost:
          "text-text hover:bg-surface-muted hover:text-text",
        subtle:
          "bg-primary-soft text-primary hover:bg-blue-100 font-semibold",
        danger:
          "bg-danger text-white hover:bg-red-700 shadow-sm",
        warning:
          "bg-warning text-white hover:bg-amber-700 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-11 px-6 text-base rounded-xl",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
