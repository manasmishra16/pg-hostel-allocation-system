import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading data from server...",
  className,
}) => {
  return (
    <div className={cn("p-12 rounded-3xl glass-card text-center space-y-4 max-w-md mx-auto my-8 border border-white/5", className)}>
      <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
      <p className="text-xs text-slate-400 font-medium">{message}</p>
    </div>
  );
};

export const SkeletonCard: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className,
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("h-36 rounded-3xl glass-card animate-pulse border border-white/5", className)}
        />
      ))}
    </div>
  );
};
