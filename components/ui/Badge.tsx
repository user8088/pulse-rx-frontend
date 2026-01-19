"use client";

import React from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "success" | "warning" | "danger" | "neutral";

const badgeClasses: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border-green-100",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-100",
  danger: "bg-red-50 text-red-700 border-red-100",
  neutral: "bg-gray-50 text-gray-700 border-gray-100",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em]",
        badgeClasses[variant],
        className
      )}
      {...props}
    />
  );
}

