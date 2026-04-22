import type { User } from "@/types/auth";

export type ViewerRole = User["role"];

export function isPharmacist(role: ViewerRole): boolean {
  return role === "pharmacist";
}

export function isProductManager(role: ViewerRole): boolean {
  return role === "product_manager";
}

export function isAdminOrStaff(role: ViewerRole): boolean {
  return role === "admin" || role === "staff";
}

/** Excel / bulk import — admin, staff, and product managers. */
export function canImportProducts(role: ViewerRole): boolean {
  return isAdminOrStaff(role) || isProductManager(role);
}

/** Can create/update/delete products via API (not pharmacist — use `canEditProductCatalog` for edits). */
export function canWriteProducts(role: ViewerRole): boolean {
  return role === "admin" || role === "staff" || role === "product_manager";
}

/** Open product editor: admin, staff, PM, pharmacist (pharmacist edits live fields per API; no create). */
export function canEditProductCatalog(role: ViewerRole): boolean {
  return role === "admin" || role === "staff" || role === "product_manager" || role === "pharmacist";
}

export function canUploadProductImages(role: ViewerRole): boolean {
  return role === "admin" || role === "staff" || role === "product_manager" || role === "pharmacist";
}

export function canDeleteProducts(role: ViewerRole): boolean {
  return isAdminOrStaff(role);
}

export function canSubmitForReview(role: ViewerRole): boolean {
  return role === "admin" || role === "staff" || role === "product_manager";
}

export function canApproveOrReject(role: ViewerRole): boolean {
  return role === "admin" || role === "staff" || role === "pharmacist";
}

/**
 * Product is in a state where Approve/Publish applies (draft, queue, rejected resubmit, or published with pending revision).
 */
export function isProductAwaitingPublication(product: {
  catalog_status?: string | null;
  revision_review_status?: string | null;
}): boolean {
  const s = product.catalog_status;
  const r = product.revision_review_status ?? "none";
  if (s === "draft" || s === "pending_review" || s === "rejected") return true;
  if (s === "published" && r === "pending") return true;
  return false;
}

/**
 * Default `catalog_status` when the URL omits `catalog_status`.
 * Pharmacists see **all** products by default so drafts and the approval queue are both reachable; they can filter to Pending review or Draft.
 */
export function defaultCatalogStatusQuery(role: ViewerRole): string | undefined {
  return undefined;
}

