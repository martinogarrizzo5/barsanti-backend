import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname == "/admin"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/news";

    return NextResponse.redirect(url);
  }

  // rewrite all /images requests to /api/uploads/images
  if (
    request.nextUrl.pathname.startsWith("/images") ||
    request.nextUrl.pathname.startsWith("/files")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/uploads" + url.pathname;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
