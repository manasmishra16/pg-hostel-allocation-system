import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-3xl glass-card border border-white/10 p-6 shadow-xl",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
