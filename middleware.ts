import { NextRequest, NextResponse } from "next/server";
import { DASHBOARD_AUTH_COOKIE } from "./lib/dashboardAuth";

function isPassthroughPath(pathname: string) {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/.well-known")) return true;
  if (/\.(ico|png|jpg|jpeg|svg|gif|webp|txt|xml|json|woff2?)$/i.test(pathname)) {
    return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPassthroughPath(pathname)) {
    return NextResponse.next();
  }

  // Set COMING_SOON=false in the environment to restore the full site.
  const comingSoon = process.env.COMING_SOON !== "false";
  if (comingSoon) {
    if (pathname === "/coming-soon") {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard/sign-in")) {
    return NextResponse.next();
  }

  const session = req.cookies.get(DASHBOARD_AUTH_COOKIE)?.value;
  if (session && session.trim().length > 0) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/dashboard/sign-in";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
