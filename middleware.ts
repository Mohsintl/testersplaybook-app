import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Public routes (NO auth required)
  const publicRoutes = [
    "/",
    "/welcome",
    "/invite",
    "/api/auth",
  ];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 🔒 Check session token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ❌ Not authenticated → redirect to landing
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ✅ Authenticated
  return NextResponse.next();
}

// 🎯 Match only app routes (NOT static files)
export const config = {
  matcher: [
    "/entry/:path*",
    "/dashboard/:path*",
    "/projects/:path*",
    "/modules/:path*",
    "/test-runs/:path*",
    "/bugs/:path*",
  ],
};
