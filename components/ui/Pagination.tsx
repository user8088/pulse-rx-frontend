import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function buildHref(basePath: string, page: number, params?: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === "string" && v.length) sp.set(k, v);
    }
  }
  if (page > 1) sp.set("page", String(page));
  else sp.delete("page");
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageWindow(current: number, last: number, size = 2) {
  const start = Math.max(1, current - size);
  const end = Math.min(last, current + size);
  return { start, end };
}

export function Pagination({
  basePath,
  currentPage,
  lastPage,
  total,
  from,
  to,
  params,
  className,
}: {
  basePath: string;
  currentPage: number;
  lastPage: number;
  total?: number;
  from?: number | null;
  to?: number | null;
  params?: Record<string, string | undefined>;
  className?: string;
}) {
  const current = clamp(currentPage || 1, 1, Math.max(1, lastPage || 1));
  const last = Math.max(1, lastPage || 1);

  if (last <= 1) return null;

  const prev = clamp(current - 1, 1, last);
  const next = clamp(current + 1, 1, last);
  const w = pageWindow(current, last, 2);

  const linkBase =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-extrabold uppercase tracking-[0.2em] transition-colors";

  const pill = (active: boolean) =>
    cn(
      linkBase,
      active ? "bg-[#EFEFEF] text-[#111827]" : "text-gray-400 hover:text-[#01AC28] hover:bg-gray-50"
    );

  const disabled = "pointer-events-none text-gray-300";

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="text-xs text-gray-500">
        {typeof from === "number" && typeof to === "number" && typeof total === "number" ? (
          <>
            Showing <span className="font-bold text-gray-700">{from}</span>–{" "}
            <span className="font-bold text-gray-700">{to}</span> of{" "}
            <span className="font-bold text-gray-700">{total}</span>
          </>
        ) : (
          <>
            Page <span className="font-bold text-gray-700">{current}</span> of{" "}
            <span className="font-bold text-gray-700">{last}</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref(basePath, prev, params)}
          className={cn(pill(false), current <= 1 ? disabled : "")}
        >
          Prev
        </Link>

        <div className="hidden sm:flex items-center gap-2">
          {w.start > 1 ? (
            <>
              <Link href={buildHref(basePath, 1, params)} className={pill(current === 1)}>
                1
              </Link>
              {w.start > 2 ? <span className="text-xs text-gray-300">…</span> : null}
            </>
          ) : null}

          {Array.from({ length: w.end - w.start + 1 }).map((_, i) => {
            const p = w.start + i;
            return (
              <Link key={p} href={buildHref(basePath, p, params)} className={pill(current === p)}>
                {p}
              </Link>
            );
          })}

          {w.end < last ? (
            <>
              {w.end < last - 1 ? <span className="text-xs text-gray-300">…</span> : null}
              <Link href={buildHref(basePath, last, params)} className={pill(current === last)}>
                {last}
              </Link>
            </>
          ) : null}
        </div>

        <Link
          href={buildHref(basePath, next, params)}
          className={cn(pill(false), current >= last ? disabled : "")}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

