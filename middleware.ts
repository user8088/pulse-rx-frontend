import { NextRequest, NextResponse } from "next/server";
import { DASHBOARD_AUTH_COOKIE } from "./lib/dashboardAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Allow unauthenticated access to the dashboard auth page.
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
  matcher: ["/dashboard/:path*"],
};

