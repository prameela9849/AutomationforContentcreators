import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E8E6DF] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]",
        hoverEffect && "transition-all duration-200 hover:shadow-md hover:border-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("p-5 border-b border-[#F0EFEA]", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3 className={cn("text-base font-semibold text-gray-900 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("p-5 border-t border-[#F0EFEA] bg-[#FAF9F5] rounded-b-xl", className)} {...props}>
      {children}
    </div>
  );
};
