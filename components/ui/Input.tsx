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
          "h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium",
          "placeholder:text-gray-400 font-normal",
          "focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300",
          "transition-all",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

