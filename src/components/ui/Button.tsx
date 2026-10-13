import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "approve" | "reject";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg";

    const variantStyles = {
      primary:
        "bg-[#71A832] text-white hover:bg-[#5B8A26] focus-visible:ring-[#71A832] shadow-sm active:bg-[#45691C]",
      secondary:
        "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 focus-visible:ring-gray-400 shadow-sm",
      outline:
        "border border-[#71A832] text-[#71A832] hover:bg-[#F4F8EC] focus-visible:ring-[#71A832]",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm",
      ghost:
        "text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400",
      approve:
        "bg-[#71A832] text-white hover:bg-[#5B8A26] focus-visible:ring-[#71A832] shadow-sm font-semibold",
      reject:
        "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 focus-visible:ring-amber-500 font-semibold",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9.5 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
