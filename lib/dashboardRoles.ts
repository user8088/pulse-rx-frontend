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
 * Default `catalog_status` when the URL omits `catalog_status`.
 */
export function defaultCatalogStatusQuery(role: ViewerRole): string | undefined {
  if (role === "pharmacist") return "pending_review";
  return undefined;
}

