import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.next();
  }

  const tokenFromQuery = searchParams.get("admin");
  const tokenFromHeader = request.headers.get("x-admin-token");
  const tokenFromCookie = request.cookies.get("admin_token")?.value;

  if (
    tokenFromQuery === adminToken ||
    tokenFromHeader === adminToken ||
    tokenFromCookie === adminToken
  ) {
    return NextResponse.next();
  }

  return new NextResponse("Not Found", { status: 404 });
}

export const config = {
  matcher: ["/admin/:path*"],
};
