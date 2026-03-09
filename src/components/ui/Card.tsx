import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "sage" | "outline";
}

const variantStyles: Record<NonNullable<CardProps["variant"]>, string> = {
  glass: "glass-card",
  solid: "bg-white shadow-sm",
  sage: "bg-sage border-l-4 border-secondary",
  outline: "bg-white border border-slate-100",
};

export function Card({ className, variant = "solid", children, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-custom", variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
