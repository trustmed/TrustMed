import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/signin(.*)",
  "/signup(.*)",
  "/legal(.*)",
]);

export default clerkMiddleware((auth, request) => {
  if (isPublicRoute(request)) {
    return;
  }

  const authWithProtect = auth as unknown as { protect?: () => void };
  if (typeof authWithProtect.protect === "function") {
    authWithProtect.protect();
    return;
  }

  const authResult = auth();
  const authResultWithProtect = authResult as { protect?: () => void };
  if (typeof authResultWithProtect.protect === "function") {
    authResultWithProtect.protect();
    return;
  }

  if (!authResult.userId) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
