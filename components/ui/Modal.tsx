"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Best-effort focus.
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative flex h-full items-end justify-center p-4 sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/10",
            className
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#374151]">{title}</div>
              {description ? <div className="mt-1 text-xs text-gray-500">{description}</div> : null}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:ring-offset-2"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

