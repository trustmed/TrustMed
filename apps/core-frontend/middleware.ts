// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/signin(.*)",
//   "/signup(.*)",
//   "/legal(.*)",
//   "/healthcheck(.*)", // Added per your previous request
// ]);

// export default clerkMiddleware(async (auth, request) => {
//   // 1. Check if the route is public
//   if (isPublicRoute(request)) {
//     return; // Let the request continue normally
//   }

//   // 2. Protect the route
//   // Calling protect() on the awaited auth() object is the standard.
//   // This internally handles the NEXT_REDIRECT signal correctly.
//   await auth.protect();
// });

// export const config = {
//   // Using the standard matcher to catch all relevant routes
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };

export default function middleware() {
  // No auth middleware needed, auth handled by backend cookies
}