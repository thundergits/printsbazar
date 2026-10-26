import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { jwtSecret } from "@/lib/secrets";


const PUBLIC_ACCOUNT_PATHS = ["/account/login", "/account/signup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = req.cookies.get("ms_admin_token")?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, jwtSecret());
        if (payload.role === "admin") return NextResponse.next();
      } catch {
        // invalid token — fall through to redirect
      }
    }

    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/account")) {
    if (PUBLIC_ACCOUNT_PATHS.includes(pathname)) return NextResponse.next();

    const token = req.cookies.get("ms_customer_token")?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, jwtSecret());
        if (payload.role === "customer") return NextResponse.next();
      } catch {
        // invalid token — fall through to redirect
      }
    }

    const loginUrl = new URL("/account/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
