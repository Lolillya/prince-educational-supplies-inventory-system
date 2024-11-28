import {
  apiAuthPrefix,
  apiTRPCPrefix,
  authRoutes,
  DEFAULT_ADMIN_REDIRECT,
  DEFAULT_EMPLOYEE_REDIRECT,
  publicRoutes,
} from "~/routes";

import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "~/auth.config";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const role = user?.role;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isApiTrpcRoute = nextUrl.pathname.startsWith(apiTRPCPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Allow api/trpc requests to pass through
  if (isApiAuthRoute || isApiTrpcRoute) {
    return NextResponse.next();
  }

  const isLoginPage = nextUrl.pathname === "/auth/login";

  if (isAuthRoute && isLoggedIn) {
    return handleAuthRouteRedirect(role, nextUrl);
  }

  if (!isLoggedIn && !isPublicRoute && !isLoginPage) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  if (isLoggedIn && role) {
    const { redirect, routes } = getRoleInfo(role);

    const hasAccess = routes.some((route) => {
      if (typeof route === "string") {
        return nextUrl.pathname.startsWith(route);
      }
      if (route instanceof RegExp) {
        return route.test(nextUrl.pathname);
      }
      return false;
    });

    if (!hasAccess) {
      return NextResponse.redirect(new URL(redirect, nextUrl));
    }
  }

  return NextResponse.next();
});

function handleAuthRouteRedirect(role: string | undefined, nextUrl: URL) {
  const { redirect } = getRoleInfo(role);
  return NextResponse.redirect(new URL(redirect, nextUrl));
}

function getRoleInfo(role: string | undefined) {
  const roleInfo: Record<
    string,
    { redirect: string; routes: (string | RegExp)[] }
  > = {
    ADMIN: {
      redirect: DEFAULT_ADMIN_REDIRECT,
      routes: [
        "/admin/dashboard",
        "/admin/restock",
        "/admin/restock/add-stock",
        "/admin/invoice",
        "/admin/invoice/new-invoice",
        "/admin/suppliers",
        "/admin/customer",
        "/admin/inventory",
        "/admin/employees",
        /^\/admin\/employees\/edit-employee\/[a-zA-Z0-9-]+$/,
        "/admin/history",
      ],
    },
  };

  return (
    roleInfo[role as keyof typeof roleInfo] || {
      redirect: DEFAULT_EMPLOYEE_REDIRECT,
      routes: ["/admin/dashboard"],
    }
  );
}

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|auth)(.*)", // Allow both api/auth and api/trpc
    "/admin/employees/edit-employee/:id*",
  ],
};
