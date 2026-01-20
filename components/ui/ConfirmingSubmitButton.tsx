"use client";

import React from "react";
import { PendingSubmitButton, type PendingSubmitButtonProps } from "./PendingSubmitButton";

export type ConfirmingSubmitButtonProps = PendingSubmitButtonProps & {
  confirmMessage?: string;
};

export function ConfirmingSubmitButton({
  confirmMessage = "Are you sure you want to perform this action?",
  onClick,
  ...props
}: ConfirmingSubmitButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(confirmMessage)) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return <PendingSubmitButton {...props} onClick={handleClick} />;
}
