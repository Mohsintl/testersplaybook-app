import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  // 🚫 Not logged in & trying to access protected routes
  if (!isAuth && !isAuthPage) {
    return NextResponse.redirect(
      new URL("/auth/signin", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/projects/:path*",
    "/dashboard/:path*",
    "/account/:path*",
  ],
};
