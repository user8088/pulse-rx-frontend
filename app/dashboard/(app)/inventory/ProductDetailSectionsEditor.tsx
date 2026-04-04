"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { ProductDetailSection } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmingSubmitButton } from "@/components/ui/ConfirmingSubmitButton";
import { getDashboardProduct, clearProductDetailSections } from "./actions";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";

function normalizeSections(sections: ProductDetailSection[] | null | undefined): ProductDetailSection[] {
  if (!Array.isArray(sections) || sections.length === 0) return [];
  return [...sections]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((s, i) => ({
      key: (s.key ?? "").trim() || `tab-${i}`,
      label: (s.label ?? "").trim() || `Tab ${i + 1}`,
      content: s.content ?? "",
      sort_order: i,
    }));
}

function newSectionKey() {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function TabCompareColumn({
  title,
  sections,
  tone,
}: {
  title: string;
  sections: ProductDetailSection[];
  tone: "slate" | "amber";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 min-h-[120px]",
        tone === "amber" ? "border-amber-200 bg-amber-50/50" : "border-gray-200 bg-gray-50/80"
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">{title}</div>
      {sections.length === 0 ? (
        <p className="text-xs text-gray-400">None</p>
      ) : (
        <div className="space-y-3">
          {sections.map((row, index) => (
            <div key={row.key + "-" + index} className="border-b border-gray-100/80 pb-2 last:border-0 last:pb-0">
              <div className="text-xs font-semibold text-gray-800">{row.label}</div>
              <div className="mt-1 text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">{row.content || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductDetailSectionsEditor({
  active,
  productId,
  formId,
  variant,
  /** For edit mode: load live storefront copy vs draft copy (PM on draft/rejected uses draft). */
  detailEditSource,
  onReadyChange,
}: {
  active: boolean;
  productId: number;
  formId: string;
  variant: "edit" | "review";
  detailEditSource: "live" | "draft";
  onReadyChange: (ready: boolean) => void;
}) {
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [sections, setSections] = useState<ProductDetailSection[]>([]);
  const [liveSections, setLiveSections] = useState<ProductDetailSection[]>([]);
  const [draftSections, setDraftSections] = useState<ProductDetailSection[]>([]);
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    if (variant === "review") {
      onReadyChange(loadState !== "loading");
    } else {
      onReadyChange(loadState !== "loading");
    }
  }, [loadState, onReadyChange, variant]);

  useEffect(() => {
    if (!active) {
      setLoadState("idle");
      return;
    }
    let cancelled = false;
    setLoadState("loading");
    getDashboardProduct(String(productId))
      .then((p) => {
        if (cancelled || !p) {
          if (!cancelled) setLoadState("error");
          return;
        }
        const live = normalizeSections(p.detail_sections);
        const draft = normalizeSections(p.detail_sections_draft);
        setLiveSections(live);
        setDraftSections(draft);

        if (variant === "review") {
          setLoadState("ready");
          return;
        }

        const initial =
          detailEditSource === "draft"
            ? normalizeSections(p.detail_sections_draft ?? p.detail_sections)
            : normalizeSections(p.detail_sections);
        setSections(initial);
        setLocked(p.detail_sections_locked !== false);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [active, productId, variant, detailEditSource]);

  const jsonPayload = useMemo(
    () =>
      JSON.stringify(
        sections.map((s, index) => ({
          key: s.key.trim(),
          label: s.label.trim(),
          content: s.content,
          sort_order: index,
        }))
      ),
    [sections]
  );

  const duplicateKeys = useMemo(() => {
    const keys = sections.map((s) => s.key.trim()).filter(Boolean);
    return keys.length !== new Set(keys).size;
  }, [sections]);

  if (!active) return null;

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
            4
          </span>
          <div>
            <span className="text-sm font-bold text-gray-900">
              {variant === "review" ? "Product descriptions (review)" : "Product descriptions"}
            </span>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {variant === "review"
                ? "Compare live catalog copy with the pending draft submitted for approval."
                : detailEditSource === "draft"
                  ? "Product manager: tab content is staged as draft until you submit for review and a pharmacist approves; the live product page stays unchanged until then."
                  : "Each block is one storefront tab: header + body. Order matches the product page."}
            </p>
          </div>
        </div>
      </div>

      {loadState === "loading" ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-6">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          Loading detail tabs…
        </div>
      ) : null}

      {loadState === "error" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Could not load detail tabs. Close and reopen, or refresh the page.
        </div>
      ) : null}

      {loadState === "ready" && variant === "review" ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <TabCompareColumn title="Live (published)" sections={liveSections} tone="slate" />
          <TabCompareColumn title="Pending draft" sections={draftSections} tone="amber" />
        </div>
      ) : null}

      {loadState === "ready" && variant === "edit" ? (
        <>
          <input type="hidden" form={formId} name="detail_sections_ready" value="1" readOnly />
          <input type="hidden" form={formId} name="detail_sections_json" value={jsonPayload} readOnly />
          <input type="hidden" form={formId} name="detail_sections_locked" value={locked ? "true" : "false"} readOnly />

          <label className="flex items-start gap-2.5 cursor-pointer select-none rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              checked={locked}
              onChange={(e) => setLocked(e.target.checked)}
            />
            <span>
              <span className="text-sm font-medium text-gray-800">Lock manual edits</span>
              <span className="block text-[11px] text-gray-500 mt-0.5">
                When enabled, spreadsheet / file sync will not overwrite these tabs. Turn off to allow the next import to replace tab content.
              </span>
            </span>
          </label>

          {duplicateKeys ? (
            <p className="text-xs font-medium text-red-600">
              Duplicate tab identifiers detected. Remove one of the duplicate tabs or reload and try again.
            </p>
          ) : null}

          <div className="space-y-4">
            {sections.map((row, index) => (
              <div
                key={row.key + "-" + index}
                className={cn(
                  "rounded-lg border border-gray-100 bg-gray-50/50 p-3 space-y-2.5",
                  duplicateKeys && "border-red-200"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tab {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Move up"
                      disabled={index === 0}
                      onClick={() => {
                        if (index === 0) return;
                        setSections((prev) => {
                          const next = [...prev];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return next;
                        });
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Move down"
                      disabled={index >= sections.length - 1}
                      onClick={() => {
                        if (index >= sections.length - 1) return;
                        setSections((prev) => {
                          const next = [...prev];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          return next;
                        });
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      title="Remove tab"
                      onClick={() => setSections((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Tab header</label>
                  <Input
                    value={row.label}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, label: e.target.value } : s))
                      )
                    }
                    placeholder="e.g. Description, Ingredients"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                  <textarea
                    value={row.content}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s, i) => (i === index ? { ...s, content: e.target.value } : s))
                      )
                    }
                    rows={5}
                    className={cn(
                      "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800",
                      "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01AC28] focus:border-transparent min-h-[100px]"
                    )}
                    placeholder="Plain text or HTML for this tab…"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() =>
              setSections((prev) => [
                ...prev,
                { key: newSectionKey(), label: "New tab", content: "", sort_order: prev.length },
              ])
            }
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add tab
          </Button>

          <div className="pt-1 border-t border-gray-100">
            <ConfirmingSubmitButton
              form={formId}
              formAction={clearProductDetailSections}
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-red-700 hover:bg-red-50"
              confirmMessage="Clear all detail tabs on the server and allow file/spreadsheet sync to repopulate them? Any other unsaved edits on this form will be lost when the page reloads."
              pendingText="Clearing…"
            >
              Clear all tabs (enable file sync)
            </ConfirmingSubmitButton>
          </div>
        </>
      ) : null}
    </div>
  );
}
