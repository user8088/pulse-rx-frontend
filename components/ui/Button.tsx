"use client";

import React from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#374151] text-white hover:bg-[#111827] shadow-sm shadow-gray-200",
  secondary:
    "bg-white text-[#374151] border border-gray-200 hover:border-gray-300 hover:bg-gray-50",
  ghost: "bg-transparent text-[#374151] hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-xs",
  lg: "h-11 px-5 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-[0.2em] transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

