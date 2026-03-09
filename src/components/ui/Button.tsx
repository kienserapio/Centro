import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "white" | "glass" | "glass-primary";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] hover:-translate-y-0.5",
  secondary:
    "bg-secondary text-white hover:bg-secondary/90",
  outline:
    "border border-secondary/20 text-secondary hover:bg-secondary/5",
  ghost:
    "text-secondary hover:bg-secondary/5",
  white:
    "bg-white text-primary hover:scale-105",
  glass:
    "bg-white/10 text-white border border-white/25 hover:bg-white/18 backdrop-blur-sm shadow-[inset_0_1.5px_0_rgba(255,255,255,0.28),0_8px_40px_rgba(34,78,24,0.45)]",
  "glass-primary":
    "bg-primary text-white border border-primary/30 backdrop-blur-sm shadow-[inset_0_1.5px_0_rgba(255,255,255,0.30),0_8px_36px_rgba(255,140,66,0.40)] hover:brightness-105",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-[15px]",
  lg: "px-8 py-4 text-base",
  xl: "px-10 py-5 text-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-bold rounded-[30px] transition-all duration-200 cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
