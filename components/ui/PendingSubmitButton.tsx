"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export type PendingSubmitButtonProps = Omit<ButtonProps, "type"> & {
  pendingText?: React.ReactNode;
  showSpinner?: boolean;
  spinnerClassName?: string;
};

export function PendingSubmitButton({
  children,
  pendingText = "Please wait…",
  showSpinner = true,
  spinnerClassName,
  disabled,
  className,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = Boolean(disabled || pending);

  return (
    <Button
      {...props}
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={className}
    >
      {showSpinner && pending ? (
        <span
          aria-hidden
          className={cn(
            "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
            spinnerClassName
          )}
        />
      ) : null}
      <span>{pending ? pendingText : children}</span>
    </Button>
  );
}

