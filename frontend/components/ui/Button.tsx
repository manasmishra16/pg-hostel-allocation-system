import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98]",
      secondary:
        "bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/10 active:scale-[0.98]",
      outline:
        "bg-transparent hover:bg-white/5 text-white font-medium border border-white/15 hover:border-white/30 active:scale-[0.98]",
      ghost:
        "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-medium active:scale-[0.98]",
      danger:
        "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold border border-rose-500/40 active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs rounded-xl",
      md: "px-5 py-2.5 text-xs rounded-full",
      lg: "px-6 py-3.5 text-sm rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
