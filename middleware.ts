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

  return NextResponse.next();
}
