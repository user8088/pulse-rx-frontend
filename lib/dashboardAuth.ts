// Dashboard auth is separate from storefront auth.
// We store the returned Sanctum bearer token in an httpOnly cookie scoped to `/dashboard`.
export const DASHBOARD_AUTH_COOKIE = "prx_dashboard_token";
export const DASHBOARD_AUTH_COOKIE_PATH = "/dashboard";

