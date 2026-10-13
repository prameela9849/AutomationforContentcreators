import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "success" | "warning" | "error" | "neutral" | "demo" | "purple";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "brand",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    brand: "bg-[#F4F8EC] text-[#45691C] border border-[#CEE2AE]",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    error: "bg-rose-50 text-rose-800 border border-rose-200",
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
    demo: "bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium rounded-md",
    md: "px-2.5 py-1 text-xs font-semibold rounded-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 shrink-0 select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
