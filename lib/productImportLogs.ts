import { dashboardFetch } from "@/lib/dashboardApi";
import { readErrorMessage } from "@/lib/api/readErrorMessage";
import type { PaginatedProductImportLogs, ProductImportLog } from "@/types";

type FetchOk<T> = { ok: true; data: T; usedPath: string };
type FetchErr = { ok: false; message: string; tried: string[]; status?: number };

async function tryFetchJson<T>(paths: string[]): Promise<FetchOk<T> | FetchErr> {
  const tried: string[] = [];
  let lastStatus: number | undefined;
  let lastMessage = "Request failed";

  for (const path of paths) {
    tried.push(path);
    let res: Response;
    try {
      res = await dashboardFetch(path, { method: "GET", cache: "no-store" });
    } catch (err: unknown) {
      lastMessage = err instanceof Error ? err.message : "Network error";
      continue;
    }

    lastStatus = res.status;
    if (!res.ok) {
      lastMessage = await readErrorMessage(res);
      continue;
    }

    const json = (await res.json()) as T;
    return { ok: true, data: json, usedPath: path };
  }

  return { ok: false, message: lastMessage, tried, status: lastStatus };
}

function coerceImportLogsPayload(
  payload: unknown
): { logs: ProductImportLog[]; pagination?: Omit<PaginatedProductImportLogs, "data"> } {
  if (Array.isArray(payload)) return { logs: payload as ProductImportLog[] };

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const data = obj.data;
    if (Array.isArray(data)) {
      const pagination = { ...(obj as unknown as PaginatedProductImportLogs) } as PaginatedProductImportLogs;
      delete (pagination as Partial<PaginatedProductImportLogs>).data;
      return { logs: data as ProductImportLog[], pagination };
    }

    // Common non-paginated wrappers
    const logs = obj.logs ?? obj.imports ?? obj.items;
    if (Array.isArray(logs)) return { logs: logs as ProductImportLog[] };
  }

  return { logs: [] };
}

function coerceImportLogDetail(payload: unknown): ProductImportLog | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  if (typeof obj.import_uuid === "string") return payload as ProductImportLog;

  const nested = obj.data ?? obj.log;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    if (typeof n.import_uuid === "string") return nested as ProductImportLog;
  }

  return null;
}

export async function getProductImportLogs(page?: number) {
  const qs = page ? `?page=${page}` : "";

  const paths = [
    `/products/import/logs${qs}`,
    `/dashboard/products/import/logs${qs}`,
    `/product-import-logs${qs}`,
    `/dashboard/product-import-logs${qs}`,
  ];

  const res = await tryFetchJson<unknown>(paths);
  if (!res.ok) return res;

  const { logs, pagination } = coerceImportLogsPayload(res.data);
  return { ok: true as const, logs, pagination, usedPath: res.usedPath };
}

export async function getProductImportLogByUuid(importUuid: string) {
  const u = encodeURIComponent(importUuid);

  const paths = [
    `/products/import/logs/${u}`,
    `/dashboard/products/import/logs/${u}`,
    `/product-import-logs/${u}`,
    `/dashboard/product-import-logs/${u}`,
    `/products/import/logs?import_uuid=${u}`,
    `/dashboard/products/import/logs?import_uuid=${u}`,
  ];

  const res = await tryFetchJson<unknown>(paths);
  if (!res.ok) return res;

  const log = coerceImportLogDetail(res.data);
  if (!log) {
    return {
      ok: false as const,
      message: "Unexpected import-log response shape.",
      tried: paths,
      status: 200,
    };
  }

  return { ok: true as const, log, usedPath: res.usedPath };
}

