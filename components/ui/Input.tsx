"use client";

import React from "react";
import { cn } from "@/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-transparent",
          "transition-all shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

