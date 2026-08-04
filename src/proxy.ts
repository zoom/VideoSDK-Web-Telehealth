import { NextResponse } from "next/server";

import { auth } from "~/server/auth";

// Next 16 proxy: always runs on Node.js runtime, so DrizzleAdapter + postgres-js are fine here.
const FORBIDDEN_FOR_PATIENT = ["/patients", "/viewNotes"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  // Home: anonymous → LandingPage; authed-but-no-role → onboarding; else through.
  if (pathname === "/") {
    if (req.auth && role == null) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    return NextResponse.next();
  }

  // Every other page is auth-required.
  if (!req.auth) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (role == null && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
  if (role != null && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (
    role === "patient" &&
    FORBIDDEN_FOR_PATIENT.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    )
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip API, Next internals, and every public/static file with an extension.
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};
