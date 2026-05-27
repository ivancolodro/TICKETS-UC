import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import {
  authRoutes,
  defaultCustomerRedirect,
  defaultLoginRedirect,
  publicRoutes,
} from "@/config/routes";
import { canAccessPath } from "@/lib/rbac/route-access";
import type { UserRole } from "@prisma/client";

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const isLoggedIn = !!token;
    const role = token?.role as UserRole | undefined;

    if (isAuthRoute(pathname) && isLoggedIn && role) {
      const redirect =
        role === "CUSTOMER" ? defaultCustomerRedirect : defaultLoginRedirect;
      return NextResponse.redirect(new URL(redirect, req.url));
    }

    if (!isPublicRoute(pathname) && isLoggedIn && role) {
      if (!canAccessPath(role, pathname)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (isPublicRoute(pathname)) return true;

        if (isAuthRoute(pathname)) return true;

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
