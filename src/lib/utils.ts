import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | number, formatStr = "MMM d, yyyy"): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, formatStr);
  } catch (e) {
    return String(date);
  }
}

export function formatTimeAgo(date: string | Date | number): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch (e) {
    return String(date);
  }
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
