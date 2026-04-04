import type { CatalogStatus } from "@/types/product";
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

/** Excel / bulk import — admin & staff only per catalog workflow. */
export function canImportProducts(role: ViewerRole): boolean {
  return isAdminOrStaff(role);
}

/** Can create/update/delete products via API (not pharmacist). */
export function canWriteProducts(role: ViewerRole): boolean {
  return role === "admin" || role === "staff" || role === "product_manager";
}

export function canUploadProductImages(role: ViewerRole): boolean {
  return role === "admin" || role === "staff" || role === "product_manager";
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
 * PM may edit only draft/rejected rows. Admin/staff always (when they can open editor).
 */
export function canProductManagerEditRow(status: CatalogStatus | undefined | null): boolean {
  // Missing status on older rows: allow edit so PMs are not locked out of the UI.
  return status == null || status === "draft" || status === "rejected";
}

/**
 * Default `catalog_status` when the URL omits `catalog_status` (show everything on the dashboard list).
 * Narrow with the status dropdown (e.g. pharmacists → “Pending review”).
 */
export function defaultCatalogStatusQuery(_role: ViewerRole): string | undefined {
  return undefined;
}
