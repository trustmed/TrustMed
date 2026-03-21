import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/signin", "/signup", "/legal", "/healthcheck"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes and static assets through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for our backend-issued JWT stored as an HttpOnly cookie
  const hasSession = request.cookies.has("access_token");

  if (!hasSession) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};