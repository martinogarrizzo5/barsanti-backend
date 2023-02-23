import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname == "/admin"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/events";

    return NextResponse.redirect(url);
  }

  // rewrite all /images requests to /api/uploads/images
  if (request.nextUrl.pathname.startsWith("/images")) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/uploads" + url.pathname;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
